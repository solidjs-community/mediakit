/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthPluginOptions } from '.'
import * as babel from '@babel/core'
import {
  addMissingImports,
  appendRouteAction,
  getArgs,
  getNodeInfo,
  getProtectedContent,
} from './utils'
export const authLoc = `@solid-mediakit/auth`

export function createTransformAuth$(opts: AuthPluginOptions) {
  return function transformAuth$({
    types: t,
    template: temp,
  }: {
    types: typeof babel.types
    template: typeof babel.template
  }): babel.PluginObj {
    return {
      visitor: {
        CallExpression(path) {
          const nodeInfo = getNodeInfo(path, t)
          if (nodeInfo.isProtected) {
            const args = getArgs(path, t, opts)
            if (nodeInfo.isProtected) {
              const protectedComp = path.node
                .arguments[0] as babel.types.ArrowFunctionExpression

              path.traverse({
                Identifier(innerPath: any) {
                  if (
                    innerPath.node.name === 'session$' &&
                    innerPath.scope?.path?.listKey !== 'params'
                  ) {
                    innerPath.node.name = '_$$session()'
                  }
                },
              })

              addMissingImports(path, t, opts, args)
              appendRouteAction(temp, path, t, opts, args)
              protectedComp.params = []

              const content = (protectedComp as any).body
              const callGetUser = t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('_$$session'),
                  t.callExpression(t.identifier('createAsync'), [
                    t.arrowFunctionExpression(
                      [],
                      t.callExpression(t.identifier('_$$getUser'), []),
                    ),
                    t.objectExpression([
                      t.objectProperty(
                        t.identifier('deferStream'),
                        t.booleanLiteral(true),
                      ),
                    ]),
                  ]),
                ),
              ])

              // const s = createAsync(...)
              // const f = createAsync(...)
              // search for all the createAsync calls within content.body

              // const createAsyncCalls = content.body.filter((node: any) => {
              //   return (
              //     t.isVariableDeclaration(node) &&
              //     t.isCallExpression(node.declarations[0].init) &&
              //     t.isIdentifier(node.declarations[0].init.callee) &&
              //     node.declarations[0].init.callee.name === 'createAsync'
              //   )
              // })

              // content.body = content.body.filter((node: any) => {
              //   return !createAsyncCalls.includes(node)
              // })

              const RenderProtected = t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('_$$RenderProtected'),
                  t.arrowFunctionExpression([], t.blockStatement(content.body)),
                ),
              ])

              content.body = [RenderProtected]
              if (args.fallBack) {
                const RenderFallBack = t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.identifier('_$$RenderFallBack'),
                    args.fallBack,
                  ),
                ])
                content.body.unshift(RenderFallBack)
              }
              content.body.unshift(callGetUser)

              const newPage = t.arrowFunctionExpression([], content)
              ;(newPage.body as any).body.push(
                t.returnStatement(getProtectedContent(t, args)),
              )
              ;(newPage.body as any).body = [...(newPage.body as any).body]

              path.replaceWith(newPage)
            }
          }
        },
      },
    }
  }
}

export async function compileAuth(
  code: string,
  id: string,
  opts: AuthPluginOptions,
) {
  const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
  const transformAuth$ = createTransformAuth$(opts)
  const transformed = await babel.transformAsync(code, {
    presets: [['@babel/preset-typescript'], ...(opts?.babel?.presets ?? [])],
    parserOpts: {
      plugins,
    },
    plugins: [[transformAuth$], ...(opts?.babel?.plugins ?? [])],
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
