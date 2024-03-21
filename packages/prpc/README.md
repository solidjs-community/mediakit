# @solid-mediakit/prpc

A typesafed Wrapper for Solid's RPC protocol

### Installation

```bash
pnpm install @solid-mediakit/prpc@latest @tanstack/solid-query@latest
```

### Adding The Vite Plugin

Go ahead to `app.config.ts` and add the following:

```ts
import { defineConfig } from '@solidjs/start/config'
import { prpcVite } from '@solid-mediakit/prpc' // ->

export default defineConfig({
  ssr: true,
  //   **right here**
  vite: {
    plugins: [prpcVite({ log: true })],
  },
})
```

Basically, what is going to happen is that the Vite plugin will make this piece of code run on the server, causing it so Zod doesn't leak to the client nor any other server-side code. What's so special about it is that it includes many useful features which aren't build in Vinxi, like Zod validation, `event$` property, custom error handling and more. The transformation process is done via Babel at real time so you don't have to worry about having ugly code in your code base, you just write it and we are in charge of the 'behind the scenes' stuff.

## Usage

### Query

```tsx
// server function declaration
import { query$ } from '@solid-mediakit/prpc'
import { z } from 'zod'

const testQuery = query$({
  queryFn: async ({ payload, event$ }) => {
    const ua = event$.request.headers.get('user-agent')
    console.log({ ua })
    return `hey ${payload.hello}`
  },
  key: 'hello',
  schema: z.object({
    hello: z.string(),
  }),
})

// client code:
// input should be an accessor
const hello = testQuery(() => ({
  hello: 'JDev',
}))
```

#### Transforms Into

```ts
const __$helloQuery = cache(async ({ payload: _$$payload }) => {
  'use server'
  const _$$validatedZod = await validateZod(
    _$$payload,
    z.object({
      hello: z.string(),
    })
  )
  if (_$$validatedZod instanceof Response) return _$$validatedZod
  const _$$event = getRequestEvent()
  const ua = _$$event.request.headers.get('user-agent')
  console.log({
    ua,
  })
  return `hey ${_$$validatedZod.hello}`
}, 'hello')
const testQuery = query$({
  queryFn: __$helloQuery,
  key: 'hello',
})
```

### Mutation

```tsx
// server function declaration
import { z } from 'zod'
import { error$, mutation$ } from '@solid-mediakit/prpc'

const testMutation = mutation$({
  mutationFn: ({ payload, event$ }) => {
    const ua = event$.request.headers.get('user-agent')
    console.log({ ua })
    if (payload.hello === 'error') {
      return error$('This is an error')
    }
    return `hey ${payload.hello}`
  },
  key: 'hello',
  schema: z.object({
    hello: z.string(),
  }),
})

// client code
const Home: VoidComponent = () => {
  const [hello, setHello] = createSignal('')
  const helloMutation = testMutation(() => ({
    onError(error) {
      if (error.isZodError()) {
        console.log('zod error:', error.cause.fieldErrors)
      } else {
        console.log(error.message)
      }
    },
  }))
  return (
    <main class='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <p class='text-2xl text-white'>
        {helloMutation.data ?? 'No Data yet...'}
      </p>
      <Show when={helloMutation.isError}>
        <p class='text-2xl text-red-500'>
          {helloMutation.error?.message ?? 'Unknown Error'}
        </p>
      </Show>
      <div class='container flex flex-col items-center justify-center gap-4 px-4 py-16'>
        <input
          type='text'
          class='p-4 text-2xl rounded-lg'
          value={hello()}
          onInput={(e) => setHello(e.currentTarget.value)}
        />
        <button
          class='p-4 text-2xl bg-white rounded-lg'
          onClick={() => helloMutation.mutate({ hello: hello() })}
        >
          Submit
        </button>
      </div>
    </main>
  )
}
```

#### Transforms Into

```ts
const __$helloMutation = cache(async ({ payload: _$$payload }) => {
  'use server'
  const _$$validatedZod = await validateZod(
    _$$payload,
    z.object({
      hello: z.string(),
    })
  )
  if (_$$validatedZod instanceof Response) return _$$validatedZod
  const _$$event = getRequestEvent()
  const ua = _$$event.request.headers.get('user-agent')
  console.log({
    ua,
  })
  if (_$$validatedZod.hello === 'error') {
    return error$('This is an error')
  }
  return `hey ${_$$validatedZod.hello}`
}, 'hello')
const testMutation = mutation$({
  mutationFn: __$helloMutation,
  key: 'hello',
})
```
