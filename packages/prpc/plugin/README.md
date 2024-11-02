# @solid-mediakit/prpc-plugin

A Vite plugin for pRPC

### Installation

```bash
pnpm install @solid-mediakit/prpc-plugin
```

## Add to app.config.ts

Wrap your entire config with the `withPRPC` method for typesafety:

```ts
import { withPRPC } from '@solid-mediakit/prpc-plugin'

const config = withPRPC(
  {
    ssr: true,
  },
  {
    auth: 'authjs',
    authCfg: {
      source: '~/server/auth', // where your AuthJS config is located
      configName: 'authOpts', // The variable name of your AuthJS Config
      protectedMessage: 'You need to sign in first',
    },
  },
)

declare module '@solid-mediakit/prpc' {
  interface Settings {
    config: typeof config
  }
}

export default config
```
