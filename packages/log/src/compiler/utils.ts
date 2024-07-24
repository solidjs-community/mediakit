import type babel from '@babel/core'

export const logFn = (t: typeof babel.types, line?: number, name?: string) => {
  return t.arrowFunctionExpression(
    [t.identifier('_value$')],
    t.callExpression(t.identifier('print$'), [
      t.identifier('_value$'),
      line ? t.numericLiteral(line) : t.identifier('undefined'),
      name ? t.stringLiteral(name) : t.identifier('undefined'),
    ])
  )
}
