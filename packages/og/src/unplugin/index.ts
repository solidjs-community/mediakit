import { createUnplugin } from 'unplugin'
import babel from '@babel/core'
import { Runtime, transformOG } from '../compiler'
import { babel as babelUtils } from '@solid-mediakit/shared'
import { FilterPattern } from 'vite'

type Options = {
  filter?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
  log?: boolean | RegExp,
	runtime?: Runtime,
}

export const unplugin = createUnplugin((opts?: Options) => {
  const filter = babelUtils.getFilter(opts?.filter)
	const log = opts?.log
  return {
    enforce: 'pre',
    name: 'unplugin-dynamic-image',
    async transform(code, id) {
      if (!filter(id)) {
        return null
      }
      const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']

      const res = await babel.transformAsync(code, {
        plugins: [[transformOG(opts?.runtime)]],
        parserOpts: { plugins },
      })
      if (!res?.code) return null
      if (typeof log === "boolean") {
        if (log == true) console.log(id, res.code);
      }
			else if (log && log.test(id)) {
				// console.log("LOGGING!!", id, log.test(id))
				console.log(id, res.code);
			}
      return { code: res.code, map: res.map }
    },
  }
})
export const vitePlugin = unplugin.vite
export const rollupPlugin = unplugin.rollup
export const webpackPlugin = unplugin.webpack
export const rspackPlugin = unplugin.rspack
export const esbuildPlugin = unplugin.esbuild
