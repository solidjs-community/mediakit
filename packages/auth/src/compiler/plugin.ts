import type * as babel from '@babel/core'
import { getDefaultExportAsFn, replaceSession$ } from './utils.js'
import { babel as babelUtils } from '@solid-mediakit/shared'

export type Options = {
  protected: string[] | string
  // @default /login
  login?: string
  //   @default ~/server/auth
  authLocation?: string
  log?: boolean
}

export const DEFAULT_INCLUDE = 'src/**/*.{jsx,tsx,ts,js,mjs,cjs}'
export const DEFAULT_EXCLUDE = 'node_modules/**/*.{jsx,tsx,ts,js,mjs,cjs}'

export function createTransformAuth(opts?: Options) {
  return function transformAuth({
    types: t,
  }: // template: temp,
  {
    types: typeof babel.types
    template: typeof babel.template
  }): babel.PluginItem {
    return {
      visitor: {
        Program: (path) => {
          babelUtils.importIfNotThere(
            t,
            path,
            'solid-start/server',
            'createServerData$'
          )
          babelUtils.importIfNotThere(t, path, 'solid-start', 'redirect')
          babelUtils.importIfNotThere(
            t,
            path,
            opts?.authLocation ?? '~/server/auth',
            'authOptions'
          )
          babelUtils.importIfNotThere(
            t,
            path,
            '@solid-mediakit/auth',
            'getSession'
          )
          const defaultExport = path.node.body.find(
            (node): node is babel.types.ExportDefaultDeclaration =>
              node.type === 'ExportDefaultDeclaration'
          )
          if (defaultExport) {
            getDefaultExportAsFn(t, path, defaultExport, opts)
          }
          replaceSession$(path, t)
          return path
        },
      },
    }
  }
}
