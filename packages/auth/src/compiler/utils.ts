/* eslint-disable @typescript-eslint/no-extra-semi */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as babel from '@babel/core'
import type { Options } from './plugin'
import { babel as babelUtils } from '@solid-mediakit/shared'

export const getServerProtectedData = (
  t: typeof babel.types,
  opts?: Options
) => {
  const innerFn = t.arrowFunctionExpression(
    [
      t.identifier('_$_key'),
      t.objectPattern([
        t.objectProperty(t.identifier('request'), t.identifier('_request')),
      ]),
    ],
    t.blockStatement([
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('session'),
          t.awaitExpression(
            t.callExpression(t.identifier('getSession'), [
              t.identifier('_request'),
              t.identifier('authOptions'),
            ])
          )
        ),
      ]),
      t.ifStatement(
        t.unaryExpression('!', t.identifier('session'), true),
        t.blockStatement([
          t.throwStatement(
            t.callExpression(t.identifier('redirect'), [
              t.stringLiteral(opts?.login ?? '/login'),
            ])
          ),
        ])
      ),
      t.returnStatement(
        t.objectExpression([
          t.objectProperty(t.identifier('session'), t.identifier('session')),
        ])
      ),
    ])
  )
  innerFn.async = true

  return t.callExpression(t.identifier('createServerData$'), [innerFn])
}

export const getDefaultExportAsFn = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>,
  defaultExport: babel.types.ExportDefaultDeclaration,
  opts?: Options
) => {
  // const _$rData = createServerData$(...)
  const rData = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('_$rData'),
      getServerProtectedData(t, opts)
    ),
  ])
  if (defaultExport.declaration.type === 'Identifier') {
    const defaultExportName = defaultExport.declaration.name
    const scope = path.scope.getBinding(defaultExportName)
    if (scope) {
      const def = scope.path.get('init') as babel.NodePath<
        babel.types.FunctionDeclaration | babel.types.ArrowFunctionExpression
      >
      if (def.isFunctionDeclaration() || def.isArrowFunctionExpression()) {
        ;(def.node.body as any).body.unshift(rData)
        WrapWithShowSuspense(t, path, (def.node.body as any).body)
        return def
      }
    }
  } else if (
    defaultExport.declaration.type === 'FunctionDeclaration' ||
    defaultExport.declaration.type === 'ArrowFunctionExpression'
  ) {
    ;(defaultExport.declaration.body as any).body.unshift(rData)
    WrapWithShowSuspense(t, path, defaultExport.declaration.body)
    return defaultExport.declaration
  }
  return null
}

export const replaceSession$ = (
  path: babel.NodePath<babel.types.Program>,
  t: typeof babel.types
) => {
  path.traverse({
    Identifier: (path) => {
      if (
        path.node.name === 'session$' &&
        path.scope?.path?.listKey !== 'params'
      ) {
        if (path.parentPath.isCallExpression()) {
          path.replaceWith(
            t.optionalMemberExpression(
              t.callExpression(t.identifier('_$rData'), []),
              t.identifier('session'),
              false,
              true
            )
          )
        } else {
          path.remove()
        }
      }
    },
  })
}

const WrapWithShowSuspense = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>,
  body: babel.types.BlockStatement | babel.types.Expression
) => {
  babelUtils.importIfNotThere(t, path, 'solid-js', 'Show')
  const returnStatement = (
    (body.type === 'BlockStatement' ? body.body : body) as any
  ).find(
    (node: any) => node.type === 'ReturnStatement'
  ) as babel.types.ReturnStatement
  const show = t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier('Show'),
      [
        t.jsxAttribute(
          t.jsxIdentifier('when'),
          t.jsxExpressionContainer(
            t.optionalMemberExpression(
              t.callExpression(t.identifier('_$rData'), []),
              t.identifier('session'),
              false,
              true
            )
          )
        ),
      ],
      false
    ),
    t.jsxClosingElement(t.jsxIdentifier('Show')),
    [t.jsxText('\n'), returnStatement.argument as any, t.jsxText('\n')],
    false
  )
  returnStatement.argument = show
}
