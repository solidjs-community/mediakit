import type { PluginObj } from '@babel/core'
import type babel from '@babel/core'
import { babel as babelUtils } from '@solid-mediakit/shared'
import type { Options } from '../unplugin'
import { logFn, noopFn } from './utils'

export function createTransformLog(opts: Options) {
  return ({ types: t }: { types: typeof babel.types }): PluginObj => {
    return {
      visitor: {
        Program(path) {
          babelUtils.importIfNotThere(t, path, 'solid-js', 'createEffect')
          babelUtils.importIfNotThere(t, path, 'solid-js', 'on')
          babelUtils.importIfNotThere(
            t,
            path,
            '@solid-mediakit/log',
            'unwrapValue'
          )
          path.traverse({
            CallExpression(path) {
              if (
                t.isIdentifier(path.node.callee) &&
                path.node.callee.name === 'log$'
              ) {
                const shouldLog =
                  opts.logOn === 'always'
                    ? true
                    : opts.logOn === 'development'
                    ? process.env.NODE_ENV === 'development'
                    : process.env.NODE_ENV === 'production'
                const arg = path.node.arguments[0]
                if (arg) {
                  path.replaceWith(
                    t.callExpression(t.identifier('createEffect'), [
                      t.callExpression(t.identifier('on'), [
                        t.arrowFunctionExpression(
                          [],
                          t.callExpression(t.identifier('unwrapValue'), [arg])
                        ),
                        shouldLog ? logFn(t) : noopFn(t),
                      ]),
                    ])
                  )
                }
              }
            },
          })
        },
      },
    }
  }
}
