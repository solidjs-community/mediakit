import type babel from '@babel/core'

export const logFn = (t: typeof babel.types) => {
  return t.arrowFunctionExpression(
    [t.identifier('_value$')],
    t.callExpression(t.identifier('console.log'), [t.identifier('_value$')])
  )
}

export const noopFn = (t: typeof babel.types) => {
  return t.arrowFunctionExpression([], t.identifier('null'))
}
