/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite'
import { compileAuth, type AuthPluginOptions } from './compiler'
import { babel as babelUtils, repushPlugin } from '@solid-mediakit/shared'

export function authVite(opts: AuthPluginOptions): Plugin {
  const filter = babelUtils.getFilter(opts?.filter)
  const plugin: Plugin = {
    enforce: 'pre',
    name: 'auth',
    async transform(code, id) {
      if (!filter(id)) {
        return code
      }
      if (code.includes('protected$(') || code.includes('session$')) {
        return await compileAuth(code, id, opts)
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
