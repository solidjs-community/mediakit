/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as babel from '@babel/core'
import { createFilter } from '@rollup/pluginutils'
import { getFileName } from './solid'
import { FilterPattern } from 'vite'
export const importIfNotThere = (
  path:
    | babel.NodePath<babel.types.CallExpression>
    | babel.NodePath<babel.types.Program>,
  t: typeof babel.types,
  name: string,
  loc: string
) => {
  const p = (path.findParent((p) => p.isProgram())?.node ?? path.node! as any).body
  const nameIsimported = p.some(
    (n: any) =>
      n.type === 'ImportDeclaration' &&
      n.specifiers.some((s: any) => s.imported.name === name)
  )

  if (!nameIsimported) {
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier(name), t.identifier(name))],
      t.stringLiteral(loc)
    )
    p.unshift(importDeclaration)
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

export const noopFn = (t: typeof babel.types) => {
  return t.arrowFunctionExpression([], t.identifier('null'))
}

export const DEFAULT_INCLUDE = 'src/**/*.{jsx,tsx,ts,js,mjs,cjs}'
export const DEFAULT_EXCLUDE = 'node_modules/**/*.{jsx,tsx,ts,js,mjs,cjs}'

export const getFilter = (f?: {
  include?: FilterPattern
  exclude?: FilterPattern
}) => {
  const filter = createFilter(
    f?.include ?? DEFAULT_INCLUDE,
    f?.exclude ?? DEFAULT_EXCLUDE
  )
  return (id: string) => {
    const actualName = getFileName(id)
    return filter(actualName)
  }
}
