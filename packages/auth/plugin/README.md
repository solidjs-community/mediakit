# @solid-mediakit/auth-plugin

A Vite plugin for Mediakit Auth

### Installation

```bash
pnpm install @solid-mediakit/auth-plugin
```

### Adding The Vite Plugin

Go ahead to `app.config.ts` and add the following:

```ts
import { defineConfig } from '@solidjs/start/config'
import { authVite } from '@solid-mediakit/auth-plugin' // ->

export default defineConfig({
  ssr: true,
  vite: {
    plugins: [authVite({ log: false })], // ->
  },
})
```

Now read the [Auth documentation](https://mediakit-taupe.vercel.app/auth/install)
