# @solid-mediakit/Log

Logs utility library for Solid.

### Installation

```
pnpm install @solid-mediakit/log
```

### Vite

Go to `vite.config.ts` and add the following:

```ts
import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import { vitePlugin } from '@solid-mediakit/log/unplugin'

export default defineConfig(() => {
  return {
    plugins: [
      solid({ ssr: true, inspect: true }),
      vitePlugin({}),
      // vitePlugin({
      //   logOn: 'production' | 'development' | 'always', // default: 'always'
      // }),
    ],
  }
})
```

### Usage

```tsx
import { log$ } from '@solid-mediakit/log'
import { createSignal, type VoidComponent } from 'solid-js'

const Home: VoidComponent = () => {
  const [value, setValue] = createSignal('')

  log$(value)

  return (
    <div class='flex flex-col gap-2 items-center justify-center py-12'>
      <h1 class='text-3xl font-bold'>Home</h1>
      <input
        class='border border-gray-400 rounded p-2'
        type='text'
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
      />
    </div>
  )
}

export default Home
```

[Read More Here](https://mediakit-taupe.vercel.app/log/install)
