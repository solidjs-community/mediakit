# @solid-mediakit/forms-plugin

A Vite plugin for MediaKit Forms

### Installation

```bash
pnpm install @solid-mediakit/forms-plugin
```

### Adding The Vite Plugin

Go ahead to `app.config.ts` and add the following:

```ts
import { defineConfig } from '@solidjs/start/config'
import { formsPlugin } from '@solid-mediakit/forms-plugin'

export default defineConfig({
  ssr: true,
  vite: {
    plugins: [formsPlugin()],
  },
})
```
