import { createUnplugin } from 'unplugin'
import babel from '@babel/core'
import { createFilter } from '@rollup/pluginutils'
import { createTransformLog } from '../compiler'

export const DEFAULT_INCLUDE = 'src/**/*.{jsx,tsx,ts,js,mjs,cjs}'
export const DEFAULT_EXCLUDE = 'node_modules/**/*.{jsx,tsx,ts,js,mjs,cjs}'

export type Options = {
  // @default 'always
  logOn?: 'production' | 'development' | 'always'
}
export const unplugin = createUnplugin((opts?: Options) => {
  const filter = createFilter(DEFAULT_INCLUDE, DEFAULT_EXCLUDE)
  const newOpts = getOptions(opts)
  return {
    enforce: 'pre',
    name: 'unplugin-log',
    async transform(code) {
      const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
      const transformLog = createTransformLog(newOpts)
      const res = await babel.transformAsync(code, {
        plugins: [[transformLog]],
        parserOpts: { plugins },
      })
      if (!res?.code) return null
      return { code: res.code, map: res.map }
    },
    transformInclude(id): boolean {
      return filter(id)
    },
  }
})

const getOptions = (opts?: Options) => {
  return {
    logOn: opts?.logOn ?? 'always',
  }
}
export const vitePlugin = unplugin.vite
export const rollupPlugin = unplugin.rollup
export const webpackPlugin = unplugin.webpack
export const rspackPlugin = unplugin.rspack
export const esbuildPlugin = unplugin.esbuild
