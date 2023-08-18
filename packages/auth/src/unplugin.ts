import { createUnplugin } from 'unplugin'
import {
  DEFAULT_EXCLUDE,
  DEFAULT_INCLUDE,
  createTransformAuth,
  type Options,
} from './compiler/plugin.js'
import * as babel from '@babel/core'
import { createFilter } from '@rollup/pluginutils'
import { type Plugin } from 'vite'

const isProtected = (protectedRoutes: string[], id: string) => {
  return protectedRoutes.some((route) => id.includes(`routes/${route}`))
}

async function compileAuth(code: string, id: string, opts?: Options) {
  const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
  const transformAuth = createTransformAuth(opts)
  const transformed = await babel.transformAsync(code, {
    presets: [['@babel/preset-typescript']],
    parserOpts: {
      plugins,
    },
    plugins: [[transformAuth]],
    filename: id,
    sourceMaps: true,
    sourceFileName: id,
  })
  if (transformed) {
    opts?.log && console.log(transformed.code)
    return {
      code: transformed.code ?? '',
      map: transformed.map,
    }
  }
  return null
}

// From: https://github.com/bluwy/whyframe/blob/master/packages/jsx/src/index.js#L27-L37
function repushPlugin(
  plugins: Plugin[],
  pluginName: string,
  pluginNames: string[]
): void {
  const namesSet = new Set(pluginNames)

  let baseIndex = -1
  let targetIndex = -1
  let targetPlugin: Plugin
  for (let i = 0, len = plugins.length; i < len; i += 1) {
    const current = plugins[i]
    if (namesSet.has(current.name) && baseIndex === -1) {
      baseIndex = i
    }
    if (current.name === pluginName) {
      targetIndex = i
      targetPlugin = current
    }
  }
  if (baseIndex !== -1 && targetIndex !== -1 && baseIndex < targetIndex) {
    plugins.splice(targetIndex, 1)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    plugins.splice(baseIndex, 0, targetPlugin!)
  }
}

export default createUnplugin((opts?: Options) => {
  const protectedRoutes =
    (typeof opts?.protected === 'string'
      ? [opts.protected]
      : opts?.protected) ?? []
  const filter = createFilter(DEFAULT_INCLUDE, DEFAULT_EXCLUDE)
  return {
    vite: {
      enforce: 'pre',
      configResolved(config) {
        repushPlugin(config.plugins as Plugin[], 'vite-plugin-auth', [
          // https://github.com/solidjs/vite-plugin-solid/blob/master/src/index.ts#L305
          'solid',
          // https://github.com/solidjs/solid-start/blob/main/packages/start/vite/plugin.js#L118
          'solid-start-file-system-router',
        ])
      },
    },
    name: 'vite-plugin-auth',
    transformInclude(id): boolean {
      return filter(id) && isProtected(protectedRoutes, id)
    },
    async transform(code, id) {
      return await compileAuth(code, id, opts)
    },
  }
})
