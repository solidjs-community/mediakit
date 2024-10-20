/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthPCPluginOptions } from '.'
import * as babel from '@babel/core'
import {
  addRequestIfNeeded,
  appendSession,
  cleanOutParams,
  exportBuilderMw,
  getFunctionArgs,
  getNodeInfo,
  handleBuilderMw,
  importIfNotThere,
  isGetId,
  shiftMiddleware,
} from './utils'

export const packageSource = `@solid-mediakit/authpc`

export function createTransform$(opts?: AuthPCPluginOptions<any>) {
  const wrappedEles: {
    source: string
    name: string
  }[] = []
  return function transform$({
    types: t,
    template: temp,
  }: {
    types: typeof babel.types
    template: typeof babel.template
  }): babel.PluginObj {
    return {
      visitor: {
        Program: {
          exit(path) {
            const scope = path.scope.bindings
            const keys = Object.keys(scope)
            const mwKeys = keys.filter(
              (key) => key.startsWith('_$$') && key.endsWith('_mws'),
            )
            if (mwKeys.length) {
              exportBuilderMw(mwKeys, path, t)
            }
          },
        },

        CallExpression(path, state) {
          const currentFileName = state.file.opts.filename
          const nodeInfo = getNodeInfo(path, t, currentFileName!)
          if (nodeInfo.isMiddleware) {
            const isShared =
              t.isMemberExpression(nodeInfo.callee) &&
              t.isIdentifier(nodeInfo.callee.object)
                ? isGetId(t, nodeInfo.callee.object)
                  ? null
                  : nodeInfo.callee.object.name
                : null

            handleBuilderMw(path, t, isShared)
          } else if (nodeInfo.isGet) {
            importIfNotThere(path, t, 'getRequestEvent', 'solid-js/web')
            importIfNotThere(path, t, nodeInfo.isGet)

            const args = getFunctionArgs(path, t, nodeInfo)!

            const payload = t.objectProperty(
              t.identifier('input$'),
              t.identifier('_$$payload'),
            )

            const usingMw = shiftMiddleware(
              temp,
              t,
              path,
              args.serverFunction,
              nodeInfo.originalName,
            )
            appendSession(
              path,
              t,
              temp,
              args.serverFunction,
              args.protected.value,
              opts,
            )
            addRequestIfNeeded(args.serverFunction, t, path, usingMw)
            cleanOutParams('input$', path, '_$$payload', t)
            if (args.serverFunction?.params) {
              args.serverFunction.params[0] = t.objectPattern([payload])
            }

            if (
              args.zodSchema &&
              !t.isIdentifier(args.zodSchema, { name: 'undefined' })
            ) {
              importIfNotThere(path, t, 'validateSchema')
              const asyncParse = temp(
                `const _$$validated = await validateSchema(_$$payload, %%zodSchema%%);`,
              )({ zodSchema: args.zodSchema })
              const ifStatement = t.ifStatement(
                t.binaryExpression(
                  'instanceof',
                  t.identifier('_$$validated'),
                  t.identifier('Response'),
                ),
                t.returnStatement(t.identifier('_$$validated')),
              )
              args.serverFunction.body.body.unshift(asyncParse, ifStatement)
              if (path.node.arguments.length > 0) {
                path.node.arguments.splice(0, 1)
              }

              path.traverse({
                Identifier(innerPath: any) {
                  if (
                    innerPath.node.name === '_$$payload' &&
                    innerPath.scope?.path?.listKey !== 'params'
                  ) {
                    if (
                      innerPath.parentPath.node.type !== 'CallExpression' ||
                      innerPath.parentPath.node.callee.name !== 'validateSchema'
                    ) {
                      innerPath.node.name = '_$$validated'
                    }
                  }
                },
              })
            }

            const destructuring = args.serverFunction?.params?.[0]
            if (destructuring && t.isObjectPattern(destructuring)) {
              destructuring.properties = destructuring.properties.filter(
                (p: any) => p.key.name !== 'event$' && p.key.name !== 'ctx$',
              )
            }
            const originFn = t.arrowFunctionExpression(
              args._method === 'GET'
                ? [t.identifier('_$$payload')]
                : args.serverFunction.params,
              args.serverFunction.body,
              true,
            )

            ;(originFn.body as any).body.unshift(
              t.expressionStatement(t.stringLiteral('use server')),
            )

            if (args._method === 'GET') {
              importIfNotThere(path, t, 'GET', '@solidjs/start')
            }

            const wrappedArg =
              args._method === 'GET'
                ? t.callExpression(t.identifier('GET'), [originFn])
                : originFn

            const props = t.objectExpression([
              t.objectProperty(t.identifier('protected'), args.protected),
              t.objectProperty(t.identifier('key'), args.key),
              t.objectProperty(
                t.identifier('method'),
                t.stringLiteral(args._method),
              ),
              t.objectProperty(
                t.identifier('type'),
                t.stringLiteral(args._fnType),
              ),
            ])
            if (nodeInfo.isWrapped) {
              wrappedEles.push({
                name: nodeInfo.originalName!,
                source: currentFileName!,
              })
              path.node.callee = t.identifier(nodeInfo.isGet)
            }
            path.node.arguments = [wrappedArg, props]
          }
        },
      },
    }
  }
}

export async function compilepAuthPC(
  code: string,
  id: string,
  opts?: AuthPCPluginOptions<any>,
) {
  try {
    const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
    const transform$ = createTransform$(opts)
    const transformed = await babel.transformAsync(code, {
      presets: [['@babel/preset-typescript'], ...(opts?.babel?.presets ?? [])],
      parserOpts: {
        plugins,
      },
      plugins: [[transform$], ...(opts?.babel?.plugins ?? [])],
      filename: id,
    })
    if (transformed) {
      if (opts?.log) {
        console.log(id, transformed.code)
      }
      return {
        code: transformed.code ?? '',
        map: transformed.map,
      }
    }
    return null
  } catch (e) {
    console.error('err$$', e)
    return null
  }
}
