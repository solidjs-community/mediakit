/* eslint-disable @typescript-eslint/no-extra-semi */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as babel from '@babel/core'

export const importIfNotThere = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>,
  from: string,
  shouldImport: string
) => {
  const serverImport = path.node.body.find(
    (node) =>
      node.type === 'ImportDeclaration' &&
      node.source.value === from &&
      node.specifiers.find(
        (specifier) =>
          specifier.type === 'ImportSpecifier' &&
          (specifier.imported as any).name === shouldImport
      )
  )
  if (!serverImport) {
    path.node.body.unshift(
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier(shouldImport),
            t.identifier(shouldImport)
          ),
        ],
        t.stringLiteral(from)
      )
    )
  }
}

export const pushCode = (
  temp: typeof babel.template,
  path: babel.NodePath<babel.types.Program>,
  code: string,
  pushToTop = false
) => {
  const c = temp(code)()
  const cAsArray = Array.isArray(c) ? c : [c]
  if (pushToTop) {
    const lastImport = path.node.body.findIndex(
        (node) => node.type !== 'ImportDeclaration'
      ),
      before = path.node.body.slice(0, lastImport),
      after = path.node.body.slice(lastImport)
    path.node.body = [...before, ...cAsArray, ...after]
  } else {
    path.node.body.push(...cAsArray)
  }
}

export const getRouteDataProtectedExport = (t: typeof babel.types) => {
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
      t.expressionStatement(
        t.callExpression(t.identifier('console.log'), [
          t.stringLiteral('session'),
          t.identifier('session'),
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
  const exportStatement = t.exportNamedDeclaration(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('routeData'),
        t.arrowFunctionExpression(
          [],
          t.blockStatement([
            t.returnStatement(
              t.callExpression(t.identifier('createServerData$'), [innerFn])
            ),
          ])
        )
      ),
    ])
  )
  return exportStatement
}

export const getDefaultExportAsFn = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>,
  defaultExport: babel.types.ExportDefaultDeclaration
) => {
  // const _$rData = useRouteData();
  const rData = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('_$rData'),
      t.callExpression(t.identifier('useRouteData'), [])
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
        return def
      }
    }
  } else if (
    defaultExport.declaration.type === 'FunctionDeclaration' ||
    defaultExport.declaration.type === 'ArrowFunctionExpression'
  ) {
    ;(defaultExport.declaration.body as any).body.unshift(rData)
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
