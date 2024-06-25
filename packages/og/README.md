# @solid-mediakit/og

An Open Graph / Dynamic image utility library for Solid.

### Installation

```
pnpm install @solid-mediakit/og
```

### Usage

```tsx
import { Title } from '@solidjs/meta'
import Counter from '~/components/Counter'
import { DynamicImage, Image } from '@solid-mediakit/og'
import { createSignal } from 'solid-js'

export default function Home() {
  const [count, setCount] = createSignal(0)
  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <Counter count={count()} setCount={setCount} />
      <Image>
        <DynamicImage>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'font-size': '128px',
              background: 'lavender',
            }}
          >
            {`Hello ${count() * 2}!`}
          </div>
        </DynamicImage>
      </Image>
    </main>
  )
}
```

[Read More Here](https://mediakit-taupe.vercel.app/og/install)
