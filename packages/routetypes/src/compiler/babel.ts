/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PluginOptions } from '.'
import * as babel from '@babel/core'
import { $Map, __UNIQUE__, MODIFIED } from '..'
import { tsTemplate } from '../utils'
import { importIfNotThere } from './utils'

export const packageSource = `@solid-mediakit/routetypes`

export function createTransform$(opts?: PluginOptions) {
  function replaceDeclaration(buildNavigatorInterface: any[]): babel.PluginObj {
    return {
      visitor: {
        TSInterfaceDeclaration(path) {
          if (path.node.id.name === 'Navigator') {
            for (const name of __UNIQUE__) {
              importIfNotThere(path as any, babel.types, name, './typed-routes')
            }
            path.replaceWithMultiple(buildNavigatorInterface)
          }
        },
      },
    }
  }

  return { replaceDeclaration }
}

export async function compile(
  buildNavigatorInterface: string[],
  code: string,
  id: string,
  map: $Map,
  opts?: PluginOptions,
) {
  const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
  const { replaceDeclaration } = createTransform$(opts)
  const transformed = await babel.transformAsync(code, {
    presets: [...(opts?.babel?.presets ?? [])],
    parserOpts: {
      plugins,
    },
    plugins: [
      [
        () =>
          replaceDeclaration(buildNavigatorInterface.map((e) => tsTemplate(e))),
      ],
      ...(opts?.babel?.plugins ?? []),
    ],
    filename: id,
  })
  if (transformed) {
    const c = transformed.code ? `${MODIFIED}\n${transformed.code}` : ''
    const newCode = c.includes('export interface Navigator')
      ? c
      : c.replace('interface Navigator {', 'export interface Navigator {')
    return {
      code: newCode,
      map: transformed.map,
    }
  }
  return null
}
