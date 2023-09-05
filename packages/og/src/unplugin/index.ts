import { createUnplugin } from 'unplugin'

function getExtension(filename: string): string {
  const index = filename.lastIndexOf('.')
  return index < 0 ? '' : filename.substring(index).replace(/\?.+$/, '')
}
export const unplugin = createUnplugin(() => {
  return {
    enforce: 'pre',
    name: 'unplugin-dynamic-image',
    transform(code, id) {
      const currentFileExtension = getExtension(id)
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
      return null;
    },
  }
})
export const vitePlugin = unplugin.vite
export const rollupPlugin = unplugin.rollup
export const webpackPlugin = unplugin.webpack
export const rspackPlugin = unplugin.rspack
export const esbuildPlugin = unplugin.esbuild
