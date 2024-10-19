# @solid-mediakit/authpc-plugin

A Vite plugin for AuthPC

### Installation

```bash
pnpm install @solid-mediakit/authpc-plugin
```

## Add to app.config.ts

Wrap your entire config with the `withAuthPC` method for typesafety:

```ts
import { withAuthPC } from '@solid-mediakit/authpc-plugin'

const config = withAuthPC(
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

declare module '@solid-mediakit/authpc' {
  interface Settings {
    config: typeof config
  }
}

export default config
```
