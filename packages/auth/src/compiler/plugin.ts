import type * as babel from '@babel/core'
import {
  getDefaultExportAsFn,
  getRouteDataProtectedExport,
  importIfNotThere,
  replaceSession$,
} from './utils.js'

export type Options = {
  protected: string[] | string
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
          importIfNotThere(t, path, 'solid-start/server', 'createServerData$')
          importIfNotThere(t, path, 'solid-start', 'useRouteData')
          importIfNotThere(
            t,
            path,
            opts?.authLocation ?? '~/server/auth',
            'authOptions'
          )
          importIfNotThere(t, path, '@solid-mediakit/auth', 'getSession')
          path.node.body.push(getRouteDataProtectedExport(t))
          const defaultExport = path.node.body.find(
            (node) => node.type === 'ExportDefaultDeclaration'
          ) as babel.types.ExportDefaultDeclaration
          if (defaultExport) {
            getDefaultExportAsFn(t, path, defaultExport)
          }
          replaceSession$(path, t)
        },
      },
    }
  }
}
