import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import { vitePlugin } from '@solid-mediakit/log/unplugin'

export default defineConfig(() => {
  return {
    plugins: [
      solid({ ssr: true, inspect: true }),
      vitePlugin({
        logOn: 'production',
      }),
    ],
  }
})
