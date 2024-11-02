import { withPRPC } from '@solid-mediakit/prpc-plugin'

const config = withPRPC(
  {
    ssr: true,
  },
  {
    log: true,
    auth: 'authjs',
    authCfg: {
      source: '~/server/auth',
      configName: 'authOpts',
      protectedMessage: 'You need to sign in first',
    },
  },
)

export default config

declare module '@solid-mediakit/prpc' {
  interface Settings {
    config: typeof config
  }
}
