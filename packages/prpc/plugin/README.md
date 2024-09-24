# @solid-mediakit/prpc-plugin

A Vite plugin for pRPC

### Installation

```bash
pnpm install @solid-mediakit/prpc-plugin
```

### Adding The Vite Plugin

Go ahead to `app.config.ts` and add the following:

```ts
import { defineConfig } from '@solidjs/start/config'
import { prpcVite } from '@solid-mediakit/prpc-plugin' // ->

export default defineConfig({
  ssr: true,
  vite: {
    plugins: [prpcVite({ log: false })], // ->
  },
})
```

Now read the [pRPC documentation](https://mediakit-taupe.vercel.app/prpc/install)
