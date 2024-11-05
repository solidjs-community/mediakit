/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PRPCPluginOptions } from '.'
import * as babel from '@babel/core'
import {
  addRequestIfNeeded,
  appendSession,
  cleanOutParams,
  getFunctionArgs,
  getNodeInfo,
  handleMw,
  importIfNotThere,
  onProgramExit,
  shiftMiddleware,
} from './utils'

export const packageSource = `@solid-mediakit/prpc`

export function createTransform$(opts?: PRPCPluginOptions<any>) {
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
            onProgramExit(t, path)
          },
        },
        CallExpression(path, state) {
          const currentFileName = state.file.opts.filename
          const nodeInfo = getNodeInfo(
            path,
            t,
            currentFileName!,
            opts?.advanced,
          )
          if (nodeInfo.isMiddleware) {
            handleMw(t, path)
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
              nodeInfo._shouldUseMw,
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
                    innerPath.node?.name === '_$$payload' &&
                    innerPath.scope?.path?.listKey !== 'params'
                  ) {
                    if (
                      innerPath.parentPath.node.type !== 'CallExpression' ||
                      innerPath.parentPath.node.callee?.name !==
                        'validateSchema'
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
                (p: any) => p.key?.name !== 'event$' && p.key?.name !== 'ctx$',
              )
            }
            const originFn = t.arrowFunctionExpression(
              args._method === 'GET'
                ? [t.identifier('_$$payload')]
                : args.serverFunction.params,
              args.serverFunction.body,
              true,
            )

            const expr = t.expressionStatement(t.stringLiteral('use server'))
            if (Array.isArray((originFn.body as any)?.body)) {
              ;(originFn.body as any).body.unshift(expr)
            } else {
              ;(originFn.body as any) = t.blockStatement([
                expr,
                t.returnStatement(originFn.body as any),
              ])
            }

            if (args._method === 'GET') {
              importIfNotThere(
                path,
                t,
                args._cache ? 'cache' : 'GET',
                args._cache ? '@solidjs/router' : '@solidjs/start',
              )
            }

            const wrappedArg =
              args._method === 'GET'
                ? t.callExpression(
                    t.identifier(args._cache ? 'cache' : 'GET'),
                    [originFn],
                  )
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
              path.node.callee = t.identifier(nodeInfo.isGet)
            }
            path.node.arguments = [wrappedArg, props]
          }
        },
      },
    }
  }
}

export async function compilePRPC(
  code: string,
  id: string,
  opts?: PRPCPluginOptions<any>,
) {
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
}
