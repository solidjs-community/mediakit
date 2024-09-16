import { defineConfig } from '@solidjs/start/config'
import { formsPlugin } from '@solid-mediakit/forms-plugin'

export default defineConfig({
  ssr: true,
  vite: {
    plugins: [formsPlugin({ log: false })],
  },
})
