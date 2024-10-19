import { withAuthPC } from '@solid-mediakit/authpc-plugin'

const config = withAuthPC(
  {
    ssr: true,
  },
  {
    log: true,
    auth: 'clerk',
    authCfg: {
      middleware: './src/middleware.ts',
      protectedMessage: 'You need to sign in first',
    },
  },
)

export default config

declare module '@solid-mediakit/authpc' {
  interface Settings {
    config: typeof config
  }
}
