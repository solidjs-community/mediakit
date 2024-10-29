import * as babel from '@babel/core'
import { packageSource } from './babel'
import { resolve, dirname } from 'path'
import { readFileSync } from 'fs'
import { AuthPCPluginOptions } from '.'

export const addRequestIfNeeded = (
  serverFunction: any,
  t: typeof babel.types,
  path: babel.NodePath<babel.types.CallExpression>,
  usingMw: boolean,
) => {
  const isEventReferenced = (
    functionPath: babel.NodePath<
      babel.types.Function | babel.types.CallExpression
    >,
  ) => {
    let isReferenced = false
    functionPath.traverse({
      Identifier(innerPath: any) {
        if (
          innerPath.node.name === 'event$' ||
          innerPath.node.name === 'session$'
        ) {
          isReferenced = true
        }
      },
      MemberExpression(innerPath: any) {
        if (
          t.isIdentifier(innerPath.node.property) &&
          (innerPath.node.property.name === 'event$' ||
            innerPath.node.property.name === 'session$')
        ) {
          isReferenced = true
        }
      },
    })
    return isReferenced
  }

  const shouldAddRequest =
    serverFunction?.params?.[0]?.properties?.some(
      (p: any) => p.key.name === 'event$',
    ) ||
    usingMw ||
    isEventReferenced(path)
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
      MemberExpression(innerPath: any) {
        if (
          t.isIdentifier(innerPath.node.property) &&
          innerPath.node.property.name === 'event$'
        ) {
          innerPath.node.property.name = '_$$event'
        }
      },
    })
  }
}

const allowedMethod = ['createCaller', 'createAction'] as const

export const getNodeInfo = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  currentFileName: string,
) => {
  const { callee } = path.node

  let isGet = isGetId(t, callee)
  let originalName: string | null = null
  let isWrapped = false
  const p = (path.findParent((p) => p.isProgram())!.node as any).body

  if (!isGet) {
    if (t.isIdentifier(callee)) {
      const scope = path.scope.bindings
      const checkForEle = (
        name: string,
        prev: string[],
      ): null | (typeof allowedMethod)[number] => {
        const temp = scope?.[name]
        if (!temp || !temp.path) return null
        if (
          t.isImportSpecifier(temp.path.node) &&
          t.isIdentifier(temp.path.node.imported)
        ) {
          const tempResults = readValue(t, temp, p, currentFileName, name)
          if (tempResults.isWrapped) {
            isWrapped = true
            if (tempResults.originalName) {
              originalName = tempResults.originalName
            }
            return tempResults.method
          }
        }
        if (t.isVariableDeclarator(temp.path.node)) {
          const current = temp.path.node
          const curr = isGetId(t, current.init)
          if (curr) {
            isWrapped = true
            originalName = name
            return curr
          } else {
            const currentName = name
            const t = checkForEle((current.init as any).name, [...prev, name])
            if (t) {
              originalName = currentName
              isWrapped = true
              return t
            }
          }
          return checkForEle((current.init as any).name, [...prev, name])
        }
        return null
      }
      isGet = checkForEle(callee.name, [])
    }
  }

  let isMiddleware = false
  let currentCallee = callee

  while (t.isMemberExpression(currentCallee)) {
    const object = currentCallee.object
    const property = currentCallee.property

    if (isGetId(t, object) && t.isIdentifier(property, { name: 'use' })) {
      isMiddleware = true
    } else if (t.isIdentifier(property, { name: 'use' })) {
      isMiddleware = true
    } else {
      isMiddleware = false
      break
    }

    currentCallee = object
  }

  return {
    isMiddleware,
    isGet,
    callee,
    obName: isWrapped || isMiddleware || isGet ? getBuilderName(path) : null,
    originalName,
    isWrapped,
    currentFileName,
  }
}

export const isGetId = (
  t: typeof babel.types,
  path: any,
): null | (typeof allowedMethod)[number] => {
  if (t.isIdentifier(path)) {
    const includes = allowedMethod.includes(path.name as any)
    if (includes) {
      return path.name as any
    }
  }
  return null
}

export const getFunctionArgs = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  nodeInfo: Awaited<ReturnType<typeof getNodeInfo>>,
) => {
  const pArgs = path.node.arguments

  const serverFunction: any =
    // method(schema,fn,opts)
    pArgs.length === 3
      ? pArgs[1]
      : // method(fn)
        // method(fn, opts)
        pArgs.length === 1 || t.isObjectExpression(pArgs[1])
        ? pArgs[0]
        : // method(schema, fn)
          pArgs[1]

  let _key: null = null
  let _protected: null = null
  let _method: 'GET' | 'POST' = undefined!
  let _fnType: 'action' | 'query' = undefined!
  let _cache = true

  const _opts = // method(schema,fn,opts)
    pArgs.length === 3
      ? pArgs[2]
      : // method(fn, opts)
        pArgs[1]
        ? pArgs[1]
        : null

  const validOpts = _opts && t.isObjectExpression(_opts)

  const zodSchema =
    // method(schema,fn,opts)
    pArgs.length === 3
      ? pArgs[0]
      : // method(schema, fn)
        pArgs.length === 2 && !validOpts
        ? pArgs[0]
        : // method(fn, opts)
          undefined

  if (validOpts) {
    const getProp = (name: string) => {
      const base = (
        _opts.properties.find((prop: any) => prop.key.name === name) as any
      )?.value
      if (typeof base === 'object') {
        return base.value
      }
      return base
    }

    _key = getProp('key')
    _protected = getProp('protected')
    _fnType = getProp('type')
    _method = getProp('method')
    _cache = getProp('cache') === false ? false : true
  }

  _fnType =
    nodeInfo.isGet === 'createAction' ? 'action' : !_fnType ? 'query' : _fnType
  if (!_method) {
    _method = _fnType === 'action' ? 'POST' : 'GET'
  }

  const key = t.isStringLiteral(_key)
    ? _key
    : typeof _key === 'string'
      ? t.stringLiteral(_key)
      : t.stringLiteral(nodeInfo.obName!)

  const isProtected =
    _protected && t.isBooleanLiteral(_protected)
      ? _protected
      : typeof _protected === 'boolean'
        ? t.booleanLiteral(_protected)
        : t.booleanLiteral(false)

  return {
    serverFunction,
    key,
    protected: isProtected,
    zodSchema,
    _fnType,
    _method,
    _cache,
  }
}

export const cleanOutParams = (
  name: string,
  path: babel.NodePath<babel.types.CallExpression>,
  id: string | ReturnType<(typeof babel.types)['identifier']>,
  t: typeof babel.types,
) => {
  path.traverse({
    MemberExpression(innerPath: babel.NodePath<babel.types.MemberExpression>) {
      const property = innerPath.node.property
      const object = innerPath.node.object
      if (t.isIdentifier(property, { name })) {
        innerPath
          .get('property')
          .replaceWith(typeof id === 'string' ? t.identifier(id) : id)
        if (t.isIdentifier(object)) {
          innerPath.replaceWith(innerPath.node.property)
        }
      }
    },
    Identifier(innerPath: babel.NodePath<babel.types.Identifier>) {
      if (
        innerPath.node.name === name &&
        innerPath.scope?.path?.listKey !== 'params'
      ) {
        innerPath.node.name = typeof id === 'string' ? id : id.name
      }
    },
  })
}

const shouldUseMw = (
  path: babel.NodePath<babel.types.CallExpression>,
  name: string,
  isWrapped: boolean,
  originalName?: string,
) => {
  const scope = path.scope.bindings
  const keys = Object.keys(scope)
  const mwKeys = keys.filter(
    (key) => key.startsWith('_$$') && key.endsWith('_mws'),
  )

  const v = `_$$${isWrapped ? originalName : name}_mws`
  return mwKeys.find((e) => e === v)
}

export const shiftMiddleware = (
  temp: typeof babel.template,
  t: typeof babel.types,
  path: babel.NodePath<babel.types.CallExpression>,
  serverFunction: any,
  originalName?: string | null,
) => {
  const req = '_$$event'
  const parentPath = path.findParent((p) => p.isVariableDeclarator())

  let name: string = originalName ?? null!
  if (!originalName) {
    if (parentPath && parentPath.isVariableDeclarator()) {
      const variableDeclarator = parentPath.node
      if (t.isIdentifier(variableDeclarator.id)) {
        name = variableDeclarator.id.name
      }
    } else {
      throw new Error(
        'No variable assigned to the result of this CallExpression.',
      )
    }
  }

  if (
    shouldUseMw(path, name, typeof originalName === 'string', originalName!)
  ) {
    importIfNotThere(path, t, 'callMiddleware$')
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
      if (
        !importedFrom.specifiers.some(
          (s: any) => t.isImportSpecifier(s) && (s.imported as any).name === v,
        )
      )
        importedFrom.specifiers.push(
          t.importSpecifier(t.identifier(v), t.identifier(v)),
        )
    }
    const callMiddleware = temp(
      `const ctx$ = await callMiddleware$(${req}, %%middlewares%%)`,
    )({
      middlewares: v,
    })

    const ifStatement = t.ifStatement(
      t.binaryExpression(
        'instanceof',
        t.identifier('ctx$'),
        t.identifier('Response'),
      ),
      t.returnStatement(t.identifier('ctx$')),
    )
    serverFunction.body.body.unshift(callMiddleware, ifStatement)
    return true
  }
  return false
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
  sharedName: string | null,
) => {
  const prevMwNames = sharedName ? `_$$${sharedName}_mws` : null

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
    if (prevMwNames) {
      const p = (path.findParent((p) => p.isProgram())!.node as any).body
      const importedFrom = p.find((node: any) => {
        return (
          node.type === 'ImportDeclaration' &&
          node.specifiers?.some((s: any) => {
            if (t.isImportSpecifier(s)) {
              return (s.imported as any).name === sharedName
            }
            return false
          })
        )
      })
      if (importedFrom && t.isImportDeclaration(importedFrom)) {
        if (
          !importedFrom.specifiers.some(
            (s: any) =>
              t.isImportSpecifier(s) &&
              (s.imported as any).name === prevMwNames,
          )
        )
          importedFrom.specifiers.push(
            t.importSpecifier(
              t.identifier(prevMwNames),
              t.identifier(prevMwNames),
            ),
          )
      }
    }
    const mwsArray = prevMwNames
      ? t.arrayExpression([
          t.spreadElement(t.identifier(prevMwNames)),
          fn as any,
        ])
      : t.arrayExpression([fn as any])

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
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  name: string,
  loc?: string,
) => {
  const actualLoc = loc ?? packageSource
  const p = (path.findParent((p) => p.isProgram())!.node as any).body
  const nameIsimported = p.some(
    (n: babel.types.ImportDeclaration) =>
      n.type === 'ImportDeclaration' &&
      n.source.value === actualLoc &&
      n.specifiers.some((s: any) => s.imported.name === name),
  )

  if (!nameIsimported) {
    const isSourceImported = p.find(
      (n: babel.types.ImportDeclaration) =>
        n.type === 'ImportDeclaration' && n.source.value === actualLoc,
    ) as babel.types.ImportDeclaration
    if (isSourceImported) {
      isSourceImported.specifiers.push(
        t.importSpecifier(t.identifier(name), t.identifier(name)),
      )
    } else {
      const importDeclaration = t.importDeclaration(
        [t.importSpecifier(t.identifier(name), t.identifier(name))],
        t.stringLiteral(loc ?? packageSource),
      )
      p.unshift(importDeclaration)
    }
  }
}

export const appendSession = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  temp: typeof babel.template,
  serverFunction: any,
  isProtected: boolean,
  _opts?: AuthPCPluginOptions<any>,
) => {
  let isReferenced = false
  path.traverse({
    Identifier(innerPath: any) {
      if (innerPath.node.name === 'session$') {
        isReferenced = true
      }
    },
    MemberExpression(innerPath: any) {
      if (
        t.isIdentifier(innerPath.node.property) &&
        innerPath.node.property.name === 'session$'
      ) {
        isReferenced = true
      }
    },
  })

  const authCfg = (_opts as any)
    ?.authCfg as AuthPCPluginOptions<'authjs'>['authCfg']

  if (isReferenced && !_opts?.auth) {
    throw new Error(
      'Attempted to use session$ but no auth provider was mentioned',
    )
  }

  if (isReferenced) {
    let sessionCall: ReturnType<ReturnType<typeof temp>> = null!
    if (_opts?.auth === 'authjs') {
      const opts = authCfg?.configName ?? 'authOpts'
      const source = authCfg?.source ?? '~/server/auth'
      importIfNotThere(path, t, 'getSession', '@solid-mediakit/auth')
      importIfNotThere(path, t, opts, source)
      sessionCall = temp(
        `const session$ = await getSession(_$$event.request, ${opts});`,
      )()
    } else {
      importIfNotThere(path, t, 'auth', 'clerk-solidjs/server')
      sessionCall = temp(`const session$ = auth();`)()
    }
    if (isProtected) {
      importIfNotThere(path, t, 'error$')

      const ifStatement = t.ifStatement(
        t.unaryExpression(
          '!',
          _opts?.auth === 'clerk'
            ? t.optionalMemberExpression(
                t.identifier('session$'),
                t.identifier('userId'),
                false,
                true,
              )
            : t.identifier('session$'),
        ),
        t.blockStatement([
          t.returnStatement(
            t.callExpression(t.identifier('error$'), [
              t.stringLiteral(
                authCfg?.protectedMessage ?? 'This is a protected route',
              ),
            ]),
          ),
        ]),
      )
      serverFunction.body.body.unshift(sessionCall, ifStatement)
    } else {
      serverFunction.body.body.unshift(sessionCall)
    }
  }
}

function findBaseCallee(t: typeof babel.types, node: any) {
  // If this is a call expression, we need to inspect its callee
  if (t.isCallExpression(node)) {
    return findBaseCallee(t, node.callee)
  }

  // If it's a member expression, continue inspecting its object
  if (t.isMemberExpression(node)) {
    return findBaseCallee(t, node.object)
  }

  // If we've hit an identifier, this is the base callee
  if (t.isIdentifier(node)) {
    return node.name
  }

  return null
}

const isPackageImport = (source: string): boolean => {
  return (
    /^[a-zA-Z0-9@]+/.test(source) || // Checks for alphanumeric and `@` (for scoped packages)
    (!source.startsWith('.') && // Not a relative import
      !source.startsWith('/')) // Not an absolute import
  )
}

export const readValue = (
  t: typeof babel.types,
  temp: any,
  parentPath: any,
  currentFileName: string,
  name: string,
) => {
  let isWrapped = false
  let originalName: string = null!
  let method: (typeof allowedMethod)[number] = null!
  if (
    t.isImportSpecifier(temp.path.node) &&
    t.isIdentifier(temp.path.node.imported)
  ) {
    const importedName = temp.path.node.imported.name

    const nameIsimported = parentPath.find(
      (n: any) =>
        n.type === 'ImportDeclaration' &&
        n.specifiers.some((s: any) => s.imported.name === importedName),
    ) as babel.types.ImportDeclaration
    if (isPackageImport(nameIsimported.source.value)) {
      return { isWrapped, originalName, method }
    }

    const trvarse = (resolvedPath: string, possibleNames: string[]) => {
      const actualSource = `${resolvedPath}.ts`
      const fileContent = readFileSync(actualSource, 'utf-8')
      const ast = babel.parse(fileContent, {
        sourceType: 'module',
      })!
      babel.traverse(ast, {
        VariableDeclarator(path) {
          if (
            t.isIdentifier(path.node.id) &&
            possibleNames.includes(path.node.id.name)
          ) {
            const initNode = path.node.init
            const baseCallee = findBaseCallee(t, initNode)
            if (allowedMethod.includes(baseCallee as any)) {
              isWrapped = true
              originalName = path.node.id.name
              method = baseCallee as any
            }
          }
        },
        ImportDeclaration(path) {
          if (isPackageImport(path.node.source.value)) return
          const newSrc = resolve(
            dirname(currentFileName),
            path.node.source.value,
          )
          const possibleNames = path.node.specifiers.map(
            (e) => (e as any).imported.name,
          )
          trvarse(newSrc, possibleNames)
        },
      })
    }
    const resolvedPath = resolve(
      dirname(currentFileName),
      nameIsimported.source.value,
    )
    trvarse(resolvedPath, [name])
  }
  return {
    isWrapped,
    originalName,
    method,
  }
}
