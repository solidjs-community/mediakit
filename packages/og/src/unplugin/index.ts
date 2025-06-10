import { createUnplugin } from 'unplugin'
import babel from '@babel/core'
import { transformOG } from '../compiler'
import { babel as babelUtils } from '@solid-mediakit/shared'
import { FilterPattern } from 'vite'

type Options = {
	filter?: {
		include?: FilterPattern
		exclude?: FilterPattern
	}
	log?: boolean
	experimental: {
		static: boolean
	}
}

export const unplugin = createUnplugin((opts?: Options) => {
	const filter = babelUtils.getFilter(opts?.filter)
	let isDev = true;
	return {
		enforce: 'pre',
		name: 'unplugin-dynamic-image',
		vite: {
			config(_options, {mode}) {
				isDev = (mode === "development");
			}
		},
		async transform(code, id) {
			if (!filter(id)) {
				return null
			}
			const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
			const res = await babel.transformAsync(code, {
				plugins: [[transformOG, { experimental: { static: isDev ? false : (opts?.experimental.static ?? false) } }]],
				parserOpts: { plugins },
			})
			if (!res?.code) return null
			if (opts?.log) {
				console.log(id, res.code)
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
