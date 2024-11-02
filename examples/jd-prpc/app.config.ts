import { withPRPC } from '@solid-mediakit/prpc-plugin'

const config = withPRPC(
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

declare module '@solid-mediakit/prpc' {
  interface Settings {
    config: typeof config
  }
}
