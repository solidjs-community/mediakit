/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthPluginOptions } from '.'
import * as babel from '@babel/core'
import {
  addMissingImports,
  appendRouteAction,
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
      manipulateOptions(_, parserOpts) {
        parserOpts.plugins.push('jsx')
      },
      visitor: {
        CallExpression(path) {
          const nodeInfo = getNodeInfo(path, t)
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

            addMissingImports(path, t, opts)
            appendRouteAction(temp, path, t, opts)
            protectedComp.params = []

            const content = (protectedComp as any).body
            const callGetUser = t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier('_$$session'),
                t.callExpression(t.identifier('createAsync'), [
                  t.arrowFunctionExpression(
                    [],
                    t.callExpression(t.identifier('_$$getUser'), [])
                  ),
                ])
              ),
            ])
            const RenderProtected = t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier('_$$RenderProtected'),
                t.arrowFunctionExpression([], t.blockStatement(content.body))
              ),
            ])
            content.body = [RenderProtected]
            content.body.unshift(callGetUser)

            const newPage = t.arrowFunctionExpression([], content)
            ;(newPage.body as any).body.push(
              t.returnStatement(getProtectedContent(t))
            )

            path.replaceWith(newPage)
          }
        },
      },
    }
  }
}

export async function compileAuth(
  code: string,
  id: string,
  opts: AuthPluginOptions
) {
  if (!code.includes('protected$(') && !code.includes('session$')) {
    return null
  }
  const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx', 'flow']
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
