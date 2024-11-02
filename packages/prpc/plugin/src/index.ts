/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite'
import { compilePRPC, type PRPCPluginOptions, AllowedAuth } from './compiler'
import { repushPlugin, babel as babelUtils } from '@solid-mediakit/shared'
import {
  type SolidStartInlineConfig,
  defineConfig,
} from '@solidjs/start/config'
import type { createApp } from 'vinxi/dist/types/lib/app'

export function prpcPlugin<K extends AllowedAuth | undefined>(
  opts?: PRPCPluginOptions<K>,
): Plugin {
  const filter = babelUtils.getFilter(opts?.filter)
  const plugin: Plugin = {
    enforce: 'pre',
    name: 'prpc',
    async transform(code, id) {
      if (!filter(id)) {
        return code
      }
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        return await compilePRPC(code, id, opts)
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

export { compilePRPC }

export function withPRPC<K extends AllowedAuth | undefined>(
  config: SolidStartInlineConfig,
  opts?: PRPCPluginOptions<K>,
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
  ;(config.vite as any).ssr.noExternal.push(`@solid-mediakit/prpc`)
  ;(config.vite as any).plugins = [
    prpcPlugin(opts),
    ...(config.vite as any).plugins,
  ]
  if (opts?.auth === 'clerk') {
    config.middleware = (opts as PRPCPluginOptions<'clerk'>).authCfg.middleware
  }
  return defineConfig(config) as any
}

//
