/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite'
import {
  compilepAuthPC,
  type AuthPCPluginOptions,
  AllowedAuth,
} from './compiler'
import { repushPlugin, babel as babelUtils } from '@solid-mediakit/shared'
import {
  type SolidStartInlineConfig,
  defineConfig,
} from '@solidjs/start/config'
import type { createApp } from 'vinxi/dist/types/lib/app'

export function authpcVite<K extends AllowedAuth | undefined>(
  opts?: AuthPCPluginOptions<K>,
): Plugin {
  const filter = babelUtils.getFilter(opts?.filter)
  const plugin: Plugin = {
    enforce: 'pre',
    name: 'authpc',
    async transform(code, id) {
      if (!filter(id)) {
        return code
      }
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        return await compilepAuthPC(code, id, opts)
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

export { compilepAuthPC }

export function withAuthPC<K extends AllowedAuth | undefined>(
  config: SolidStartInlineConfig,
  opts?: AuthPCPluginOptions<K>,
): ReturnType<typeof createApp> & {
  auth: K
} {
  if (!config.vite) {
    config.vite = {}
  }
  if (!(config.vite as any).plugins) {
    ;(config.vite as any).plugins = []
  }
  if (!(config.vite as any).ssr) {
    ;(config.vite as any).ssr = {}
  }
  if (!(config.vite as any).ssr.noExternal) {
    ;(config.vite as any).ssr.noExternal = []
  }
  ;(config.vite as any).ssr.noExternal.push(`@solid-mediakit/authpc`)
  ;(config.vite as any).plugins = [
    authpcVite(opts),
    ...(config.vite as any).plugins,
  ]
  if (opts?.auth === 'clerk') {
    config.middleware = (
      opts as AuthPCPluginOptions<'clerk'>
    ).authCfg.middleware
  }
  return defineConfig(config) as any
}
