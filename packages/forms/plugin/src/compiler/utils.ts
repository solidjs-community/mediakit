import * as babel from '@babel/core'
import { formsLoc } from './babel'

const t = babel.types

export const addRequestIfNeeded = (
  serverFunction: any,
  t: typeof babel.types,
  path: babel.NodePath<
    babel.types.CallExpression | babel.types.JSXOpeningElement
  >,
) => {
  const shouldAddRequest = serverFunction?.params[0]?.properties?.some(
    (p: any) => p.key.name === 'event$',
  )
  if (shouldAddRequest) {
    serverFunction.body.body.unshift(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('_$$event'),
          t.callExpression(t.identifier('getRequestEvent'), []),
        ),
      ]),
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

export const isRenderForm = (code: string) => {
  return /Render[a-zA-Z]*Form/g.test(code)
}
export const getNodeInfo = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
) => {
  const { callee } = path.node
  if (t.isJSXElement(callee)) {
    console.log('is$$$')
  }
  console.log('calle$$', callee)
  const isCreateForm = t.isIdentifier(callee, { name: 'createForm$' })

  return {
    isCreateForm,
    callee,
  }
}

export const getFunctionArgs = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
) => {
  const arg = path.node.arguments[0]
  if (t.isObjectExpression(arg)) {
    const serverFunction = (
      arg.properties.find((prop: any) => prop.key.name === 'onSubmit') as any
    )?.value
    const zodSchema = (
      arg.properties.find((prop: any) => prop.key.name === 'schema') as any
    )?.value
    console.log('returning this')
    return {
      serverFunction,
      zodSchema,
    }
  }
  return null
}

export function findCreateFormCall(
  path: babel.NodePath<babel.types.File>,
): babel.types.Expression | null {
  let schemaExpression: babel.types.Expression | null = null

  babel.traverse(path.node, {
    CallExpression(callPath: babel.NodePath<babel.types.CallExpression>) {
      if (t.isIdentifier(callPath.node.callee, { name: 'createForm$' })) {
        const args = callPath.node.arguments
        if (args.length > 0) {
          const schemaArg = args[0]
          if (t.isObjectExpression(schemaArg)) {
            schemaExpression = schemaArg
          }
        }
      }
    },
  })

  return schemaExpression
}

export function getSchemaFromCreateForm(
  path: babel.NodePath,
): babel.types.Expression | null {
  // Find the parent of the JSXElement to locate `createForm$` calls
  const parentPath = path.findParent(
    (p) =>
      t.isCallExpression(p.node) &&
      t.isIdentifier(p.node.callee, { name: 'createForm$' }),
  )

  console.log(`pPath$$`, parentPath)
  if (parentPath && t.isCallExpression(parentPath.node)) {
    const args = parentPath.node.arguments

    // Assuming the schema is the first argument in the `createForm$` call
    if (args.length > 0) {
      const schemaArg = args[0]

      // Ensure the schema argument is an object expression (zod schema)
      if (t.isObjectExpression(schemaArg)) {
        return schemaArg
      }
    }
  }

  // Return null if schema is not found
  return null
}

export const cleanOutParams = (
  name: string,
  path: babel.NodePath<
    babel.types.CallExpression | babel.types.JSXOpeningElement
  >,
  id: string | ReturnType<(typeof babel.types)['identifier']>,
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

export const afterImports = (
  path: babel.NodePath<babel.types.CallExpression>,
  value: any,
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
  path: babel.NodePath<babel.types.CallExpression>,
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
  t: typeof babel.types,
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
  t: typeof babel.types,
) => {
  for (const name of mwKeys) {
    const currentMws = path.scope.getBinding(name)
    if (currentMws) {
      const mwsArray = (currentMws as any)?.path?.node?.init
      if (mwsArray) {
        const exportMw = t.exportNamedDeclaration(
          t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(name), mwsArray as any),
          ]),
        )
        currentMws.path.remove()
        path.node.body.push(exportMw)
      }
    }
  }
}

export const importIfNotThere = (
  path: babel.NodePath<
    babel.types.CallExpression | babel.types.JSXOpeningElement
  >,
  t: typeof babel.types,
  name: string,
  loc?: string,
) => {
  const p = (path.findParent((p) => p.isProgram())!.node as any).body
  const nameIsimported = p.some(
    (n: any) =>
      n.type === 'ImportDeclaration' &&
      n.specifiers.some((s: any) => s.imported.name === name),
  )

  //
  if (!nameIsimported) {
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier(name), t.identifier(name))],
      t.stringLiteral(loc ?? formsLoc),
    )
    p.unshift(importDeclaration)
  }
}
