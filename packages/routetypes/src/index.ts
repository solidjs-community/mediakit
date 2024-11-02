/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite'
import { compile, type PluginOptions } from './compiler'
import { repushPlugin, babel as babelUtils } from '@solid-mediakit/shared'
import { getRoot, getRoutes } from './utils'
import fs from 'fs/promises'
import path from 'path'

export const __UNIQUE__ = ['$KnownRoutes', '$KnownOrExt'] as const

const VERSION = '1.0.0'
export const MODIFIED = `// @routetypes.modified.${VERSION}`

type $Unique = (typeof __UNIQUE__)[number]
export type $Map = { [K in $Unique]: string }

export function routeTypes(opts?: PluginOptions): Plugin {
  const filter = babelUtils.getFilter(opts?.filter)
  const plugin: Plugin = {
    enforce: 'pre',
    name: 'routetypes',
    async configResolved(config) {
      repushPlugin(config.plugins as Plugin[], 'vinxi:routes', [
        'vite-server-references',
        'solid',
        'routetypes',
      ])

      const routes = await getRoutes(config as any)
      const root = getRoot(config as any)
      const asType = `type $KnownRoutes = ${routes.length ? routes.map((e) => `'${e.path}'`).join(' | ') : null}`
      const typeOrExternal = `type $KnownOrExt = $KnownRoutes | \`http://\${string}\` | \`https://\${string}\``

      const navigator = `interface Navigator {
        <Route extends $KnownRoutes>(to: Route, options?: Partial<NavigateOptions>): void;
        (delta: number): void;
    }`
      const solid_router = path.join(
        root,
        'node_modules',
        '@solidjs',
        'router',
        'dist',
      )
      const map: $Map = {
        $KnownOrExt: typeOrExternal,
        $KnownRoutes: asType,
      }
      const id = path.join(solid_router, 'types.d.ts')
      const _router_types = await fs.readFile(id, 'utf-8')
      if (!_router_types.includes(MODIFIED)) {
        const res = await compile([navigator], _router_types, id, map, opts)
        if (res?.code) {
          await fs.writeFile(id, res.code, 'utf-8')
        }
      } else {
        console.log('skipped')
      }
      await fs.writeFile(
        path.join(solid_router, 'typed-routes.d.ts'),
        `export ${asType}\nexport ${typeOrExternal}`,
      )
    },
  }
  return plugin
}
