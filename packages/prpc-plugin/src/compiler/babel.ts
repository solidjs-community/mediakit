/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PRPCPluginOptions } from '.'
import * as babel from '@babel/core'
import {
  addRequestIfNeeded,
  cleanOutParams,
  exportBuilderMw,
  getBuilderName,
  getFunctionArgs,
  getNodeInfo,
  handleBuilderMw,
  importIfNotThere,
  shiftMiddleware,
} from './utils'

export const prpcLoc = `@solid-mediakit/prpc`

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
        Program: {
          exit(path) {
            const scope = path.scope.bindings
            const keys = Object.keys(scope)
            const mwKeys = keys.filter(
              (key) => key.startsWith('_$$') && key.endsWith('_mws')
            )
            if (mwKeys.length) {
              exportBuilderMw(mwKeys, path, t)
            }
          },
        },

        CallExpression(path) {
          const nodeInfo = getNodeInfo(path, t)
          if (nodeInfo.isBuilder) {
            const name = getBuilderName(path)
            const b = `_$$${name}_mws`
            const varExists = path.scope.bindings[b]
            if (!varExists) {
              path.scope.push({
                id: t.identifier(b),
                init: t.arrayExpression([]),
              })
            }
          } else if (nodeInfo.isBuilderMiddleware) {
            handleBuilderMw(path, t)
          } else if (nodeInfo.isMutation || nodeInfo.isQuery) {
            importIfNotThere(path, t, 'cache', '@solidjs/router')
            importIfNotThere(path, t, 'getRequestEvent', 'solid-js/web')
            const args = getFunctionArgs(path, t, nodeInfo)!
            const payload = t.objectProperty(
              t.identifier('payload'),
              t.identifier('_$$payload')
            )
            shiftMiddleware(temp, t, path, args.serverFunction, nodeInfo, args)
            addRequestIfNeeded(
              args.serverFunction,
              nodeInfo.isBuilderQuery,
              nodeInfo.isBuilderMutation,
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
              importIfNotThere(path, t, 'validateZod')
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

            ;(originFn.body as any).body.unshift(
              t.expressionStatement(t.stringLiteral('use server'))
            )

            const wrappedArg = t.callExpression(t.identifier('cache'), [
              originFn,
              args.key,
            ])

            if (nodeInfo.isBuilderMutation || nodeInfo.isBuilderQuery) {
              path.node.arguments[0] = wrappedArg
            } else {
              path.node.arguments[0] = t.objectExpression([
                t.objectProperty(
                  t.identifier(nodeInfo.isQuery ? 'queryFn' : 'mutationFn'),
                  wrappedArg
                ),
                t.objectProperty(t.identifier('key'), args.key),
              ])
            }
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
      console.log(id, transformed.code)
    }
    return {
      code: transformed.code ?? '',
      map: transformed.map,
    }
  }
  return null
}
// {
//   path: NodePath {
//     contexts: [],

//     _traverseFlags: 0,
//     skipKeys: null,
//     parentPath: NodePath {
//       contexts: [Array],
//       state: undefined,
//       opts: [Object],
//       _traverseFlags: 0,
//       skipKeys: null,
//       parentPath: [NodePath],
//       container: [Array],
//       listKey: 'body',
//       key: 0,
//       node: [Object],
//       type: 'VariableDeclaration',
//       parent: [Node],
//       hub: [Object],
//       data: null,
//       context: [TraversalContext],
//       scope: [Scope]
//     },
//     container: [ [Object] ],
//     listKey: 'declarations',
//     key: 0,
//     node: { type: 'VariableDeclarator', id: [Object], init: [Object] },
//     type: 'VariableDeclarator',
//     parent: {
//       type: 'VariableDeclaration',
//       kind: 'const',
//       declarations: [Array],
//       _blockHoist: 2
//     },
//     hub: {
//       file: [File],
//       getCode: [Function: getCode],
//       getScope: [Function: getScope],
//       addHelper: [Function: bound addHelper],
//       buildError: [Function: bound buildCodeFrameError]
//     },
//     data: null,
//     context: TraversalContext {
//       queue: [Array],
//       priorityQueue: [],
//       parentPath: undefined,
//       scope: [Scope],
//       state: undefined,
//       opts: [Object]
//     },
//     scope: <ref *1> Scope {
//       uid: 7497,
//       path: [NodePath],
//       block: [Node],
//       labels: Map(0) {},
//       inited: true,
//       bindings: [Object: null prototype],
//       references: [Object: null prototype],
//       globals: [Object: null prototype] {},
//       uids: [Object: null prototype] {},
//       data: [Object: null prototype] {},
//       crawling: false
//     }
//   },
//   kind: 'const',
//   constantViolations: [],
//   constant: true,
//   referencePaths: [],
//   referenced: false,
//   references: 0,
//   hasDeoptedValue: false,
//   hasValue: false,
//   value: null
// }
