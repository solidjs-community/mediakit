import * as babel from '@babel/core'
import { authLoc } from './babel'
import { AuthPluginOptions } from '.'

export const getNodeInfo = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types
) => {
  const { callee } = path.node
  const isProtected = t.isIdentifier(callee, { name: 'protected$' })
  return {
    callee,
    isProtected,
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

export const importIfNotThere = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  name: string,
  loc?: string
) => {
  const p = (path.findParent((p) => p.isProgram())!.node as any).body
  const nameIsimported = p.some(
    (n: any) =>
      n.type === 'ImportDeclaration' &&
      n.specifiers.some((s: any) => s.imported.name === name)
  )

  if (!nameIsimported) {
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier(name), t.identifier(name))],
      t.stringLiteral(loc ?? authLoc)
    )
    p.unshift(importDeclaration)
  }
}

export const addMissingImports = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  opts: AuthPluginOptions,
  args: ReturnType<typeof getArgs>
) => {
  importIfNotThere(path, t, 'cache', '@solidjs/router')
  importIfNotThere(path, t, 'createAsync', '@solidjs/router')
  importIfNotThere(path, t, 'getRequestEvent', 'solid-js/web')
  importIfNotThere(path, t, 'getSession', '@solid-mediakit/auth')
  importIfNotThere(path, t, 'Show', 'solid-js')
  importIfNotThere(path, t, opts.authOpts.name, opts.authOpts.dir)
  if (!args.fallBack) {
    importIfNotThere(path, t, 'redirect', '@solidjs/router')
  }
}

export const getProtectedContent = (
  t: typeof babel.types,
  args: ReturnType<typeof getArgs>
) => {
  const attr = [
    t.jsxAttribute(
      t.jsxIdentifier('when'),
      t.jsxExpressionContainer(
        t.optionalMemberExpression(
          t.callExpression(t.identifier('_$$session'), []),
          t.identifier('user'),
          false,
          true
        )
      )
    ),
  ]
  if (args.fallBack) {
    attr.push(
      t.jsxAttribute(
        t.jsxIdentifier('fallback'),
        t.jsxExpressionContainer(
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier('_$$RenderFallBack'), [], true),
            t.jsxClosingElement(t.jsxIdentifier('_$$RenderFallBack')),
            [],
            true
          )
        )
      )
    )
  }
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier('Show'), attr),
    t.jsxClosingElement(t.jsxIdentifier('Show')),
    [
      t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('_$$RenderProtected'), [], true),
        t.jsxClosingElement(t.jsxIdentifier('_$$RenderProtected')),
        [],
        true
      ),
    ]
  )
}

export const appendRouteAction = (
  temp: typeof babel.template,
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  opts: AuthPluginOptions,
  args: ReturnType<typeof getArgs>
) => {
  const userKey = opts?.userKey ?? 'media-user'
  let getUserR: ReturnType<ReturnType<typeof temp>> | undefined = undefined
  if (args.fallBack) {
    getUserR = temp`const _$$getUser = cache(async () => {
      'use server'
      const event = getRequestEvent()
      return await getSession(event.request, authOptions)
    }, '${userKey}');
    `()
  } else {
    getUserR = temp`const _$$getUser = cache(async () => {
      'use server'
      const event = getRequestEvent()
      const session = await getSession(event.request, authOptions)
      if (!session) {
        throw redirect('${args.redirectTo}')
      }
      return session
    }, '${userKey}');
    `()
  }
  afterImports(path, getUserR)
  const currentRouteExport = path.scope.getBinding('route')?.path
  if (currentRouteExport) {
    const routeExport = currentRouteExport.node
    const load = (routeExport as any).init.properties.find(
      (p: any) => p.key.name === 'load'
    )
    if (load) {
      load.value = t.arrowFunctionExpression(
        [],
        t.arrayExpression([
          t.callExpression(t.identifier('_$$getUser'), []),
          t.isArrowFunctionExpression(load.value)
            ? load.value.body
            : load.value,
        ])
      )
    }
  } else {
    path.insertAfter(
      t.exportNamedDeclaration(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('route'),
            t.objectExpression([
              t.objectProperty(
                t.identifier('load'),
                t.arrowFunctionExpression(
                  [],
                  t.callExpression(t.identifier('_$$getUser'), [])
                )
              ),
            ])
          ),
        ])
      )
    )
  }
}

export const getArgs = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  opts: AuthPluginOptions
) => {
  const page = path.node.arguments[0] as babel.types.ArrowFunctionExpression
  let fallBack: babel.types.JSXElement | undefined
  let redirectTo: string | undefined
  if (path.node.arguments.length === 2) {
    if (t.isArrowFunctionExpression(path.node.arguments[1])) {
      fallBack = path.node.arguments[1] as any as babel.types.JSXElement
    } else {
      redirectTo = path.node.arguments[1] as any as string
    }
  }
  if (!redirectTo) {
    redirectTo = opts.redirectTo
  }
  return { page, fallBack, redirectTo }
}
