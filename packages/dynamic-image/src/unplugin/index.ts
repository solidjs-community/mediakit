import { createUnplugin } from 'unplugin'
import { readFile } from 'fs/promises'

import { fileURLToPath } from 'url'
import init, {
  transform,
} from '../swc-plugin-dynamic-image/pkg/swc_plugin_dynamic_image'

function getExtension(filename: string): string {
  const index = filename.lastIndexOf('.')
  return index < 0 ? '' : filename.substring(index).replace(/\?.+$/, '')
}
export const unplugin = createUnplugin((options) => {
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
      const out = transform(code, id)
      if (id.endsWith('index.tsx')) {
        // console.log(out);
      }
      return out
    },
  }
})
const wasmURL = new URL(
  './swc_plugin_dynamic_image_bg.wasm',
  import.meta.url
)
await init(await readFile(fileURLToPath(wasmURL)))
export const vitePlugin = unplugin.vite
export const rollupPlugin = unplugin.rollup
export const webpackPlugin = unplugin.webpack
export const rspackPlugin = unplugin.rspack
export const esbuildPlugin = unplugin.esbuild
