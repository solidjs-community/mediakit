import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import { vitePlugin as OGPlugin } from '@solid-mediakit/og/unplugin'

export default defineConfig({
  plugins: [OGPlugin(), solid()],
})
