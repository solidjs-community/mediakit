import { defineConfig } from '@solidjs/start/config'
import { vitePlugin as logPlugin } from '@solid-mediakit/log/unplugin'

export default defineConfig({
  vite: {
    plugins: [
      logPlugin({
        logOn: 'development',
      }),
    ],
  },
})
