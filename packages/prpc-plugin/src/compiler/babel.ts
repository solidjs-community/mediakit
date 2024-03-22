/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PRPCPluginOptions } from '.'
import * as babel from '@babel/core'
import {
  addRequestIfNeeded,
  cleanOutParams,
  getFunctionArgs,
  getNodeInfo,
  shiftMiddleware,
} from './utils'

const prpcLoc = `@solid-mediakit/prpc`

export function createTransformpRPC$() {
  return function transformpRPC$({
    types: t,
    template: temp,
  }: {
    types: typeof babel.types
    template: typeof babel.template
  }): babel.PluginObj {
    return {
      visitor: {
        Program(path) {
          const importIfNotThere = (name: string, loc?: string) => {
            const imported = path.node.body.find(
              (node: any) =>
                node.type === 'ImportDeclaration' &&
                node.source.name === (loc ?? prpcLoc)
            )
            if (!imported) {
              path.node.body.unshift(
                t.importDeclaration(
                  [t.importSpecifier(t.identifier(name), t.identifier(name))],
                  t.stringLiteral(loc ?? prpcLoc)
                )
              )
            }
          }
          importIfNotThere('validateZod')
          importIfNotThere('cache', '@solidjs/router')
          importIfNotThere('getRequestEvent', 'solid-js/web')
          importIfNotThere('callMiddleware$')
        },
        CallExpression(path) {
          const nodeInfo = getNodeInfo(path, t)
          if (nodeInfo.isMiddleware) {
            const originFn = path.node.arguments[0]
            if (t.isArrowFunctionExpression(originFn)) {
              ;(originFn.body as any).body.unshift(
                t.expressionStatement(t.stringLiteral('use server'))
              )
            }
          } else if (nodeInfo.isMutation || nodeInfo.isQuery) {
            const args = getFunctionArgs(path, t, nodeInfo)!
            const payload = t.objectProperty(
              t.identifier('payload'),
              t.identifier('_$$payload')
            )
            shiftMiddleware(temp, t, args.serverFunction, nodeInfo, args)
            addRequestIfNeeded(
              args.serverFunction,
              nodeInfo.isReuseableQuery,
              nodeInfo.isReuseableMutation,
              args.middlewares ?? [],
              t,
              path
            )
            cleanOutParams('payload', path, '_$$payload')
            args.serverFunction.params[0] = t.objectPattern([payload])
            if (
              args.zodSchema &&
              !t.isIdentifier(args.zodSchema, { name: 'undefined' })
            ) {
              const asyncParse = temp(
                `const _$$validatedZod = await validateZod(_$$payload, %%zodSchema%%);`
              )({ zodSchema: args.zodSchema })
              const ifStatement = t.ifStatement(
                t.binaryExpression(
                  'instanceof',
                  t.identifier('_$$validatedZod'),
                  t.identifier('Response')
                ),
                t.returnStatement(t.identifier('_$$validatedZod'))
              )
              args.serverFunction.body.body.unshift(asyncParse, ifStatement)
              path.traverse({
                Identifier(innerPath: any) {
                  if (
                    innerPath.node.name === '_$$payload' &&
                    innerPath.scope?.path?.listKey !== 'params'
                  ) {
                    if (
                      innerPath.parentPath.node.type !== 'CallExpression' ||
                      innerPath.parentPath.node.callee.name !== 'validateZod'
                    ) {
                      innerPath.node.name = '_$$validatedZod'
                    }
                  }
                },
              })
            }
            const destructuring = args.serverFunction.params[0]
            if (t.isObjectPattern(destructuring)) {
              destructuring.properties = destructuring.properties.filter(
                (p: any) => p.key.name !== 'event$' && p.key.name !== 'ctx$'
              )
            }
            const originFn = t.arrowFunctionExpression(
              args.serverFunction.params,
              args.serverFunction.body,
              true
            )
            // the first line of the originFn should have this line
            // 'use server'; exactly as it is, its not a function, just a string
            ;(originFn.body as any).body.unshift(
              t.expressionStatement(t.stringLiteral('use server'))
            )

            const wrappedArg = t.callExpression(t.identifier('cache'), [
              originFn,
              args.key,
            ])

            path.node.arguments[0] = t.objectExpression([
              t.objectProperty(
                t.identifier(nodeInfo.isQuery ? 'queryFn' : 'mutationFn'),
                wrappedArg
              ),
              t.objectProperty(t.identifier('key'), args.key),
            ])
          }
        },
      },
    }
  }
}

export async function compilepRRPC(
  code: string,
  id: string,
  opts?: PRPCPluginOptions
) {
  const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
  const transformpRPC$ = createTransformpRPC$()
  const transformed = await babel.transformAsync(code, {
    presets: [['@babel/preset-typescript'], ...(opts?.babel?.presets ?? [])],
    parserOpts: {
      plugins,
    },
    plugins: [[transformpRPC$], ...(opts?.babel?.plugins ?? [])],
    filename: id,
  })
  if (transformed) {
    if (opts?.log) {
      console.log(transformed.code)
    }
    return {
      code: transformed.code ?? '',
      map: transformed.map,
    }
  }
  return null
}
