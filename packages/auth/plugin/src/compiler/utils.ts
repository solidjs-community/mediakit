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
  const imported = p.find((node: any) => {
    if (!node || !node.specifiers) return false
    const ff = node.specifiers.some((s: any) => {
      return t.isImportSpecifier(s) && (s.imported as any).name === name
    })
    return (
      node.type === 'ImportDeclaration' &&
      node.source.value === (loc ?? authLoc) &&
      ff
    )
  })
  if (!imported) {
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
  opts: AuthPluginOptions
) => {
  importIfNotThere(path, t, 'cache', '@solidjs/router')
  importIfNotThere(path, t, 'redirect', '@solidjs/router')
  importIfNotThere(path, t, 'createAsync', '@solidjs/router')
  importIfNotThere(path, t, 'getRequestEvent', 'solid-js/web')
  importIfNotThere(path, t, 'getSession', '@solid-mediakit/auth')
  importIfNotThere(path, t, 'Show', 'solid-js')
  importIfNotThere(path, t, opts.authOpts.name, opts.authOpts.dir)
}

export const getProtectedContent = (t: typeof babel.types) => {
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier('Show'), [
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
    ]),
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
  opts: AuthPluginOptions
) => {
  const redirectTo = path.node.arguments[1] ?? opts?.redirectTo
  const userKey = opts?.userKey ?? 'media-user'
  const getUserR = temp`const _$$getUser = cache(async () => {
    'use server'
    const event = getRequestEvent()
    const session = await getSession(event.request, authOptions)
    if (!session) {
      throw redirect('${redirectTo}')
    }
    return session
  }, '${userKey}');
  `()

  afterImports(path, getUserR)
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
