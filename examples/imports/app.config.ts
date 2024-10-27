import { defineConfig } from '@solidjs/start/config'
import { importsPlugin } from '@solid-mediakit/imports'

export default defineConfig({
  ssr: true,
  vite: { plugins: [importsPlugin({ log: true })] },
})
