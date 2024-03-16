import { defineConfig } from '@solidjs/start/config'
import prpc from '~/prpc/plugin'

export default defineConfig({
  ssr: true,
  vite: {
    plugins: [prpc({ log: true })],
  },
})
