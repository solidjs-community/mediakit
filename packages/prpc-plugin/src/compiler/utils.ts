import * as babel from '@babel/core'
import { prpcLoc } from './babel'

export const addRequestIfNeeded = (
  serverFunction: any,
  isReuseableQuery: boolean,
  isReuseableMutation: boolean,
  middlewares: any[],
  t: typeof babel.types,
  path: babel.NodePath<babel.types.CallExpression>
) => {
  const useMw =
    (middlewares?.length ?? 0) >= 1 || isReuseableQuery || isReuseableMutation
  const shouldAddRequest =
    serverFunction.params[0].properties.some(
      (p: any) => p.key.name === 'event$'
    ) || useMw
  if (shouldAddRequest) {
    serverFunction.body.body.unshift(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('_$$event'),
          t.callExpression(t.identifier('getRequestEvent'), [])
        ),
      ])
    )
    path.traverse({
      Identifier(innerPath: any) {
        if (
          innerPath.node.name === 'event$' &&
          innerPath.scope?.path?.listKey !== 'params'
        ) {
          innerPath.node.name = '_$$event'
        }
      },
    })
  }
}

export const getNodeInfo = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types
) => {
  const { callee } = path.node
  const isBuilder = t.isIdentifier(callee, { name: 'builder$' })
  const isBuilderMiddleware =
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.property, { name: 'middleware$' })

  const isBuilderQuery =
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.property, { name: 'query$' })
  const isBuilderMutation =
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.property, { name: 'mutation$' })
  const isMutation =
    t.isIdentifier(callee, { name: 'mutation$' }) || isBuilderMutation
  const isQuery = t.isIdentifier(callee, { name: 'query$' }) || isBuilderQuery
  const isMiddleware = t.isIdentifier(callee, { name: 'middleware$' })
  return {
    isBuilderQuery,
    isBuilderMutation,
    isMiddleware,
    isMutation,
    isQuery,
    callee,
    isBuilder,
    isBuilderMiddleware,
  }
}

type NodeInfo = ReturnType<typeof getNodeInfo>

export const getFunctionArgs = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  nodeInfo: NodeInfo
) => {
  const source = (path.hub as any).file.opts.filename
  if (nodeInfo.isBuilderQuery || nodeInfo.isBuilderMutation) {
    const serverFunction = path.node.arguments[0]
    const key = path.node.arguments[1]
    const thisCall = (path.parentPath.node as any).init.callee.object
    const zodSchema = thisCall.arguments[0]

    thisCall.arguments = []

    return {
      serverFunction,
      key,
      zodSchema,
      source,
    }
  } else if (path.node.arguments.length === 1) {
    const arg = path.node.arguments[0]
    if (t.isObjectExpression(arg)) {
      const serverFunction = (
        arg.properties.find(
          (prop: any) =>
            prop.key.name === (nodeInfo.isQuery ? 'queryFn' : 'mutationFn')
        ) as any
      ).value
      const key = (
        arg.properties.find((prop: any) => prop.key.name === 'key') as any
      ).value
      const zodSchema = (
        arg.properties.find((prop: any) => prop.key.name === 'schema') as any
      )?.value
      const middlewares =
        !nodeInfo.isBuilderQuery && !nodeInfo.isBuilderMutation
          ? (
              arg.properties.find(
                (prop: any) => prop.key.name === 'middleware'
              ) as any
            )?.value?.elements.map((e: any) => e.name) ?? []
          : []

      return {
        serverFunction,
        key,
        zodSchema,
        middlewares,
        source,
      }
    }
  }
  return null
}

type FnArgs = NonNullable<ReturnType<typeof getFunctionArgs>>

export const cleanOutParams = (
  name: string,
  path: babel.NodePath<babel.types.CallExpression>,
  id: string | ReturnType<typeof babel.types['identifier']>
) => {
  path.traverse({
    Identifier(innerPath: any) {
      if (
        innerPath.node.name === name &&
        innerPath.scope?.path?.listKey !== 'params'
      ) {
        if (innerPath.parentPath.isObjectProperty()) {
          innerPath.parentPath.remove()
          if (
            innerPath.parentPath.parentPath.isVariableDeclarator() &&
            innerPath.parentPath.parentPath.node.id.properties.length === 0
          ) {
            innerPath.parentPath.parentPath.remove()
          }
        } else {
          innerPath.node.name = typeof id === 'string' ? id : id.name
        }
      }
    },
  })
}

export const shiftMiddleware = (
  temp: typeof babel.template,
  t: typeof babel.types,
  path: babel.NodePath<babel.types.CallExpression>,
  serverFunction: any,
  { isBuilderQuery, isBuilderMutation, callee }: NodeInfo,
  args: FnArgs
) => {
  if (args.middlewares?.length || isBuilderQuery || isBuilderMutation) {
    const req = '_$$event'
    const getName = () => {
      let name: string | undefined = undefined
      let currentNode: typeof callee = callee
      while (true) {
        if ('object' in currentNode) {
          if (t.isIdentifier(currentNode.object)) {
            name = currentNode.object.name
            break
          }
          currentNode = currentNode.object
        } else if ('callee' in currentNode) {
          if (t.isIdentifier(currentNode.callee)) {
            name = currentNode.callee.name
            break
          }
          currentNode = currentNode.callee
        }
      }
      return name
    }
    const name = isBuilderMutation || isBuilderQuery ? getName() : undefined
    let callMiddleware
    importIfNotThere(path, t, 'callMiddleware$')
    if (isBuilderQuery || isBuilderMutation) {
      const v = `_$$${name}_mws`
      const p = (path.findParent((p) => p.isProgram())!.node as any).body
      const importedFrom = p.find((node: any) => {
        return (
          node.type === 'ImportDeclaration' &&
          node.specifiers?.some((s: any) => {
            if (t.isImportSpecifier(s)) {
              return (s.imported as any).name === name
            }
            return false
          })
        )
      })
      if (importedFrom && t.isImportDeclaration(importedFrom)) {
        importedFrom.specifiers.push(
          t.importSpecifier(t.identifier(v), t.identifier(v))
        )
      }
      callMiddleware = temp(
        `const ctx$ = await callMiddleware$(${req}, %%middlewares%%)`
      )({
        middlewares: v,
      })
    } else {
      callMiddleware = temp(
        `const ctx$ = await callMiddleware$(${req}, %%middlewares%%)`
      )({
        middlewares: args.middlewares.map((m: any) => t.identifier(m)),
      })
    }
    const ifStatement = t.ifStatement(
      t.binaryExpression(
        'instanceof',
        t.identifier('ctx$'),
        t.identifier('Response')
      ),
      t.returnStatement(t.identifier('ctx$'))
    )
    serverFunction.body.body.unshift(callMiddleware, ifStatement)
  }
}

export const afterImports = (
  path: babel.NodePath<babel.types.CallExpression>,
  value: any
) => {
  const p = (path.findParent((p) => p.isProgram())!.node as any).body
  const lastImport = p.findLast((n: any) => n.type === 'ImportDeclaration')
  if (lastImport) {
    p.splice(p.indexOf(lastImport) + 1, 0, value)
  } else {
    p.unshift(value)
  }
}

export const getBuilderName = (
  path: babel.NodePath<babel.types.CallExpression>
) => {
  let name: string | undefined = undefined
  path.findParent((p) => {
    if (p.isVariableDeclarator()) {
      name = (p.node.id as any).name
      return true
    }
    return false
  })
  if (!name) {
    throw new Error(`Expected name to be defined`)
  }
  return name
}

export const handleBuilderMw = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types
) => {
  const name = getBuilderName(path)
  const fn = path.node.arguments[0]
  const mwName = `_$$${name}_mws`
  const currentMws = path.scope.getBinding(mwName)
  if (currentMws) {
    const mwsArray = (currentMws as any)?.path?.node?.init
    if (t.isArrayExpression(mwsArray)) {
      mwsArray.elements.unshift(fn as any)
      path.replaceWith((path.node.callee as any).object)
    } else {
      throw new Error(`Expected ${mwName} to be an array`)
    }
  } else {
    const mws = t.identifier(mwName)
    const mwsArray = t.arrayExpression([fn as any])

    path.replaceWith((path.node.callee as any).object)
    path.scope.push({
      id: mws,
      init: mwsArray,
      kind: 'const',
      _blockHoist: -1,
    })
  }
}
export const exportBuilderMw = (
  mwKeys: string[],
  path: babel.NodePath<babel.types.Program>,
  t: typeof babel.types
) => {
  for (const name of mwKeys) {
    const currentMws = path.scope.getBinding(name)
    if (currentMws) {
      const mwsArray = (currentMws as any)?.path?.node?.init
      if (mwsArray) {
        const exportMw = t.exportNamedDeclaration(
          t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(name), mwsArray as any),
          ])
        )
        currentMws.path.remove()
        path.node.body.push(exportMw)
      }
    }
  }
}

export const importIfNotThere = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  name: string,
  loc?: string
) => {
  const p = (path.findParent((p) => p.isProgram())!.node as any).body
  const imported = p.find((node: any) => {
    if (!node || !node.specifiers) return false
    const ff = node.specifiers.some((s: any) => {
      return t.isImportSpecifier(s) && (s.imported as any).name === name
    })
    return (
      node.type === 'ImportDeclaration' &&
      node.source.value === (loc ?? prpcLoc) &&
      ff
    )
  })
  if (!imported) {
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier(name), t.identifier(name))],
      t.stringLiteral(loc ?? prpcLoc)
    )
    p.unshift(importDeclaration)
  }
}
