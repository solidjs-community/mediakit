import { withAuthPC } from '@solid-mediakit/authpc-plugin'

const config = withAuthPC(
  {
    ssr: true,
  },
  {
    auth: 'authjs',
    authCfg: {
      source: '~/server/auth',
      configName: 'authOpts',
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
