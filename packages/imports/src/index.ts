/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite'
import { compilepImports, type ImportPluginOptions } from './compiler'
import { repushPlugin, getFilter } from './utils'

export function importsPlugin(opts?: ImportPluginOptions): Plugin {
  const filter = getFilter(opts?.filter)
  const plugin: Plugin = {
    enforce: 'pre',
    name: 'imports',
    async transform(code, id) {
      if (!filter(id)) {
        return code
      }
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        return await compilepImports(code, id, opts)
      }
      return undefined
    },
    configResolved(config) {
      repushPlugin(config.plugins as Plugin[], plugin, [
        'vite-server-references',
        'solid',
        'vinxi:routes',
      ])
    },
  }
  return plugin
}
