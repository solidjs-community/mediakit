import { authVite } from '@solid-mediakit/auth-plugin'
import { defineConfig } from '@solidjs/start/config'

export default defineConfig({
  ssr: true,
  middleware: './src/server/middleware.ts',
  vite: {
    plugins: [
      authVite({
        redirectTo: '/',
        log: true,
        authOpts: {
          name: 'authOptions',
          dir: '~/server/auth',
        },
      }),
    ],
  },
})
