import * as babel from '@babel/core'
import { packageSource } from './babel'

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
      n.specifiers.some((s: any) => s.imported?.name === name),
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
