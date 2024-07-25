**Adding MediaKit/log to SolidStart**

## Install

```sh
pnpm add @solid-mediakit/og
```

## Plugin Installation

Add the plugin to your config:

```ts
import { defineConfig } from '@solidjs/start/config'
import { vitePlugin as logPlugin } from '@solid-mediakit/log/unplugin'

export default defineConfig({
  vite: {
    plugins: [logPlugin()],
  },
})
```

## Options

You can choose on which `ENV` it will be printed, if you only need logs for development then specify:

```ts
logOn: 'development'
```

Default is `always`

```ts
export type Options = {
  logOn?: 'production' | 'development' | 'always'
  filter?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
}
```

Config complete! To see how to use the `log$` utility in your app, visit [Log](https://mediakit-taupe.vercel.app/log/install), or scroll bellow:

## log$

This function is used to keep track of your SolidJS signals / stores, it will nicely be printed on the console.

<img
width='923'
alt='Screenshot 2024-07-24 at 21 50 20'
src='https://github.com/user-attachments/assets/80054efb-844d-4fc9-b3df-1bf51532b3c1'
>

## Usage

#### API

```tsx
import { log$ } from '@solid-mediakit/log'

const [count, setCount] = createSignal(0)
log$(count)
```

### Actual Usage

```tsx
import { Title } from '@solidjs/meta'
import { createSignal } from 'solid-js'
import { log$ } from '@solid-mediakit/log'

export default function Home() {
  const [count, setCount] = createSignal(0)
  log$(count)

  return (
    <main>
      <Title>Hello World</Title>

      <div>
        <button
          class='increment'
          onClick={() => setCount(count() + 1)}
          type='button'
        >
          Clicks: {count()}
        </button>
      </div>
      <p>
        Visit{' '}
        <a href='https://start.solidjs.com' target='_blank'>
          start.solidjs.com
        </a>{' '}
        to learn how to build SolidStart apps.
      </p>
    </main>
  )
}
```
