/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as babel from '@babel/core'

export const importIfNotThere = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>,
  from: string,
  shouldImport: string,
  isDefault = false
) => {
  if (isDefault) {
    path.node.body.unshift(
      t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier(shouldImport))],
        t.stringLiteral(from)
      )
    )
    return
  }
  const isImported = path.node.body.find(
    (node) =>
      node.type === 'ImportDeclaration' &&
      node.source.value === from &&
      node.specifiers.find(
        (specifier) =>
          specifier.type === 'ImportSpecifier' &&
          (specifier.imported as any).name === shouldImport
      )
  )
  if (!isImported) {
    const alreadyImportedFromName = path.node.body.find(
      (node) => node.type === 'ImportDeclaration' && node.source.value === from
    )
    if (alreadyImportedFromName) {
      ;(alreadyImportedFromName as any).specifiers.push(
        t.importSpecifier(
          t.identifier(shouldImport),
          t.identifier(shouldImport)
        )
      )
      return
    }
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

export const pushStmts = (
  stmts: babel.types.Statement[] | babel.types.Statement,
  path: babel.NodePath<babel.types.Program>,
  pushToTop = false
) => {
  stmts = Array.isArray(stmts) ? stmts : [stmts]
  if (pushToTop) {
    const lastImport = path.node.body.findIndex(
        (node) => node.type !== 'ImportDeclaration'
      ),
      before = path.node.body.slice(0, lastImport),
      after = path.node.body.slice(lastImport)
    path.node.body = [...before, ...stmts, ...after]
  } else {
    path.node.body.push(...stmts)
  }
}
