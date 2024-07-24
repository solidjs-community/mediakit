/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite'
import { compilepRRPC, type PRPCPluginOptions } from './compiler'
import { repushPlugin, babel as babelUtils } from '@solid-mediakit/shared'

export function prpcVite(opts?: PRPCPluginOptions): Plugin {
  const filter = babelUtils.getFilter(opts?.filter)
  const plugin: Plugin = {
    enforce: 'pre',
    name: 'prpc',
    async transform(code, id) {
      if (!filter(id)) {
        return code
      }
      if (
        ((code.includes('query$(') ||
          code.includes('mutation$(') ||
          code.includes('builder$(') ||
          code.includes('.middleware$')) &&
          id.endsWith('.ts')) ||
        id.endsWith('.tsx')
      ) {
        return await compilepRRPC(code, id, opts)
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
