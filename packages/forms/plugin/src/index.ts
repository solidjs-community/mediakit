/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite'
import { compileForm, type FormluginOptions } from './compiler'
import { repushPlugin, babel as babelUtils } from '@solid-mediakit/shared'
import { isRenderForm } from './compiler/utils'

export function formsPlugin(opts?: FormluginOptions): Plugin {
  const filter = babelUtils.getFilter(opts?.filter)
  const plugin: Plugin = {
    enforce: 'pre',
    name: 'mediakit-forms',
    async transform(code, id) {
      if (!filter(id)) {
        return code
      }
      if (code.includes('createForm$(') || isRenderForm(code)) {
        return await compileForm(code, id, opts)
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
