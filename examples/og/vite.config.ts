import solid from 'solid-start/vite'
import { defineConfig, type Plugin } from 'vite'
import { vitePlugin } from '../../packages/og/src/unplugin'
export default defineConfig({
  plugins: [vitePlugin() as Plugin, solid()],
})
