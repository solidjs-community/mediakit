import { defineConfig } from '@solidjs/start/config'
import { routeTypes } from '@solid-mediakit/routetypes'

export default defineConfig({
  ssr: true,
  vite: {
    plugins: [routeTypes()],
  },
})
