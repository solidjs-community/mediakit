/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { compilepRRPC, type PRPCPluginOptions } from './compiler'

const DEFAULT_INCLUDE = 'src/**/*.{jsx,tsx,ts,js,mjs,cjs}'
const DEFAULT_EXCLUDE = 'node_modules/**/*.{jsx,tsx,ts,js,mjs,cjs}'

export function prpcVite(opts?: PRPCPluginOptions): Plugin {
  const filter = createFilter(
    opts?.filter?.include || DEFAULT_INCLUDE,
    opts?.filter?.exclude || DEFAULT_EXCLUDE
  )
  const plugin: Plugin = {
    enforce: 'pre',
    name: 'prpc',
    async transform(code, id) {
      id = getId(id)
      if (!filter(id)) {
        return code
      }
      if (
        code.includes('query$(') ||
        code.includes('mutation$(') ||
        (code.includes('middleware$') && id.endsWith('.ts')) ||
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

// From: https://github.com/bluwy/whyframe/blob/master/packages/jsx/src/index.js#L27-L37
function repushPlugin(
  plugins: Plugin[],
  plugin: Plugin,
  pluginNames: string[]
): void {
  const namesSet = new Set(pluginNames)

  let baseIndex = -1
  let targetIndex = -1
  for (let i = 0, len = plugins.length; i < len; i += 1) {
    const current = plugins[i]
    if (namesSet.has(current.name) && baseIndex === -1) {
      baseIndex = i
    }
    if (current.name === plugin.name) {
      targetIndex = i
    }
  }
  if (baseIndex !== -1 && targetIndex !== -1 && baseIndex < targetIndex) {
    plugins.splice(targetIndex, 1)
    plugins.splice(baseIndex, 0, plugin)
  }
}

function getId(id: string) {
  if (id.includes('?')) {
    // might be useful for the future
    const [actualId] = id.split('?')
    return actualId
  }
  return id
}
