import { withAuthPC } from '@solid-mediakit/authpc-plugin'

const config = withAuthPC(
  {
    ssr: true,
    middleware: './src/middleware.ts',
    vite: {
      ssr: {
        external: ['@prisma/client'],
      },
    },
    server: {
      preset: 'vercel',
    },
  },
  {
    log: true,
    auth: 'authjs',
    authCfg: {
      configName: 'authOptions',
      source: '~/server/auth',
    },
  },
)

export default config

declare module '@solid-mediakit/authpc' {
  interface Settings {
    config: typeof config
  }
}
