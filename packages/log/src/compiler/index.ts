import type { PluginObj } from '@babel/core'
import type babel from '@babel/core'
import type { Options } from '../unplugin'
import { logFn } from './utils'
import { babel as babelUtils } from '@solid-mediakit/shared'

export function createTransformLog(opts: Options, env: string) {
  return ({ types: t }: { types: typeof babel.types }): PluginObj => {
    return {
      visitor: {
        Program(path) {
          path.traverse({
            CallExpression(path) {
              if (
                t.isIdentifier(path.node.callee) &&
                path.node.callee.name === 'log$'
              ) {
                const line = path.node.loc?.start.line
                  ? path.node.loc?.start.line + 1
                  : undefined
                const shouldLog =
                  opts.logOn === undefined || opts.logOn === 'always'
                    ? true
                    : opts.logOn === 'development'
                    ? env === 'development'
                    : env === 'production'
                const arg = path.node.arguments[0]
                const name = 'name' in arg ? arg.name : undefined
                if (!shouldLog) {
                  path.remove()
                } else if (arg) {
                  babelUtils.importIfNotThere(
                    path,
                    t,
                    'createEffect',
                    'solid-js'
                  )
                  babelUtils.importIfNotThere(path, t, 'on', 'solid-js')
                  babelUtils.importIfNotThere(
                    path,
                    t,
                    'unwrapValue',
                    '@solid-mediakit/log'
                  )
                  babelUtils.importIfNotThere(
                    path,
                    t,
                    'print$',
                    '@solid-mediakit/log'
                  )
                  path.replaceWith(
                    t.callExpression(t.identifier('createEffect'), [
                      t.callExpression(t.identifier('on'), [
                        t.arrowFunctionExpression(
                          [],
                          t.callExpression(t.identifier('unwrapValue'), [arg])
                        ),
                        logFn(t, line, name),
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
