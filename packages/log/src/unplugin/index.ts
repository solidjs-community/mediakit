import { createUnplugin } from 'unplugin'
import babel from '@babel/core'
import { createTransformLog } from '../compiler'
import { babel as babelUtils, repushPlugin } from '@solid-mediakit/shared'
import { FilterPattern } from 'vite'

export type Options = {
  logOn?: 'production' | 'development' | 'always'
  filter?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
}
export const unplugin = createUnplugin((opts?: Options) => {
  const filter = babelUtils.getFilter(opts?.filter)
  const newOpts = getOptions(opts)
  let env: string
  return {
    enforce: 'pre',
    name: 'unplugin-log',
    vite: {
      configResolved(config) {
        env = config.mode !== 'production' ? 'development' : 'production'

        repushPlugin(config.plugins as Plugin[], 'unplugin-log', [
          'vite-server-references',
          'solid',
          'vinxi:routes',
        ])
      },
    },
    async transform(code, id) {
      if (!filter(id)) {
        return null
      }
      const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
      const transformLog = createTransformLog(newOpts, env)
      const res = await babel.transformAsync(code, {
        plugins: [[transformLog]],
        parserOpts: { plugins },
      })
      if (!res?.code) return null
      return { code: res.code, map: res.map }
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
