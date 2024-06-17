import { createUnplugin } from 'unplugin'
import babel from '@babel/core'
import { transformOG } from '../compiler'

function getExtension(filename: string): string {
  const index = filename.lastIndexOf('.')
  return index < 0 ? '' : filename.substring(index).replace(/\?.+$/, '')
}

export const unplugin = createUnplugin(() => {
  return {
    enforce: 'pre',
    name: 'unplugin-dynamic-image',
    async transform(code, id) {
      const currentFileExtension = getExtension(id)
      const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
      if (id.includes('node_modules')) {
        return
      }
      if (id.includes('solid-start')) {
        return
      }
      const extensionsToWatch = ['.tsx', '.jsx']
      if (!extensionsToWatch.includes(currentFileExtension)) {
        return null
      }
      // Temporarily hack around it transforming the output file in `dist`
      if (id.includes('index.jsx')) return
      const res = await babel.transformAsync(code, {
        plugins: [[transformOG]],
        parserOpts: { plugins },
      })
      if (!res?.code) return null
      // if (id.includes('index.tsx')) {
      //   console.log(res.code)
      // }
      return { code: res.code, map: res.map }
    },
  }
})
export const vitePlugin = unplugin.vite
export const rollupPlugin = unplugin.rollup
export const webpackPlugin = unplugin.webpack
export const rspackPlugin = unplugin.rspack
export const esbuildPlugin = unplugin.esbuild
