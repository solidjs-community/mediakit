> [Doc](https://mediakit-taupe.vercel.app/prpc/install)

## What Is pRPC

pRPC is a utility library that combines both

- Authentication (`Auth`)
- Better Solid'S RPC (`PC`)

### Supports

- pRPC currently supports two Auth Providers: [Clerk](https://clerk.com/) & [AuthJS](https://authjs.dev/).
- pRPC currently supports two Validators: [Zod](https://zod.dev/) & [ValiBot](https://valibot.dev/).

pRPC also allows you to throw type-safe errors, redirect the user, modify headers, set cookies and most importantly, you can choose to use either `GET` (allowing the use of HTTP cache-control headers) or `POST`.

That means you can create server actions completly type safe, cached, auth/session protected and all in simple function declaration, many might think but wait this is very simple to achieve in other frameworks, what took you so long to create this one, In this doc i'm actually going to explain the behind the scenes of `pRPC`.

Everything here is type-safe, it also includes middlewares and allowed to be imported to any file thanks to the advance babel plugin.

## Install

First install both the plugin & the prpc package

```bash
pnpm install @solid-mediakit/prpc@latest @solid-mediakit/prpc-plugin@latest @tanstack/solid-query@latest
```

### App Config

Wrap your entire config with the `withPRPC` method for typesafety:

```ts
import { withPRPC } from '@solid-mediakit/prpc-plugin'

const config = withPRPC({
  ssr: true,
})

// this is important: otherwise you cannot access the session$ property
declare module '@solid-mediakit/prpc' {
  interface Settings {
    config: typeof config
  }
}

export default config
```

### Note

To use any auth provider, you need to follow the guides bellow, this is optional you don't have to use any auth provider with this library, if you don't use one, you will not be able to access the `session$` property.

- I Want To Use Auth By Using AuthJS - [here](#authjs)
- I Want To Use Auth By Using Clerk - [here](#clerk)
- I Don't Use Any Auth - [here](#QueryClientProvider)

## API

- [createCaller](#createcaller)
  - [Zod](#zod)
  - [ValiBot](#valibot)
  - [Client Error Handling](#error-handling)
  - [Middlewares & .use](#use)
  - [Optimistic Updates](#optimistic-updates)
  - [Methods](#methods)
    - [POST](#post)
    - [GET](#get)
  - [Function Types](#function-types)
    - [Query](#query)
    - [Mutation](#mutation)
- [Utils](#utils)
  - [redirect$](#redirect)
  - [response$](#response)
  - [error$](#error)

## createCaller

Use this method to interact with the api, you can choose between a `query` or a `mutation` (default is query) and also choose to use either `GET`/`POST` as the request method (default is GET & wrapped with Solid's `query` function).

### No Schema

```ts
// server.ts
import { createCaller } from '@solid-mediakit/prpc'
import * as v from 'valibot'

const mySchema = v.object({ name: v.string() })

const myServerQuery = createCaller(
  ({ session$ }) => {
    console.log(session$, event$.request.headers.get('user-agent'))
    return 'Who do i say hey to'
  },
  {
    method: 'GET',
  },
)

// client.tsx
import { myServerQuery } from './server'
const query = myServerQuery()
```

### Zod

```ts
// server.ts
import { createCaller } from '@solid-mediakit/prpc'
import { z } from 'zod'

const mySchema = z.object({ name: z.string() })

export const myServerQuery = createCaller(
  mySchema,
  ({ input$, session$, event$ }) => {
    console.log(session$, event$.request.headers.get('user-agent'))
    return `Hey there ${input$.name}`
  },
  {
    method: 'GET',
  },
)

// client.tsx
import { myServerQuery } from './server'
const query = myServerQuery(() => ({ name: 'Demo' }))
```

### Valibot

```ts
// server.ts
import { createCaller } from '@solid-mediakit/prpc'
import * as v from 'valibot'

const mySchema = v.object({ name: v.string() })

export const myServerQuery = createCaller(
  mySchema,
  ({ input$, session$, event$ }) => {
    console.log(session$, event$.request.headers.get('user-agent'))
    return `Hey there ${input$.name}`
  },
  {
    method: 'GET',
  },
)

// client.tsx
import { myServerQuery } from './server'
const query = myServerQuery(() => ({ name: 'Demo' }))
```

### Error Handling

Errors are thrown using the `PRPClientError` class. When the server function has a schema defined, you can use the `isValidationError` to get the issues.

```tsx
import { createEffect } from 'solid-js'
import { myServerQuery } from './server'

const MyClient = () => {
  const query = myServerQuery(() => ({ name: 'Demo' }))

  createEffect(() => {
    if (query.error) {
      if (query.error.isValidationError()) {
        query.error.cause.fieldErrors.name // string[]
      } else {
        console.error('What is this', query.error.cause)
      }
    }
  })

  return (...)
}

export default MyClient
```

### Methods

You can choose any method (GET || POST), regardless of the function type (default is GET & wrapped with Solid's `query` function)

#### GET

This is the default so you don't have to mention it

```ts
import { createCaller, response$ } from '@solid-mediakit/prpc'

export const getRequest = createCaller(
  () => {
    return response$(
      { iSetTheHeader: true },
      { headers: { 'cache-control': 'max-age=60' } },
    )
  },
  {
    method: 'GET',
  },
)

export const getRequest2 = createCaller(() => {
  return response$(
    { iSetTheHeader: true },
    { headers: { 'cache-control': 'max-age=60' } },
  )
})
```

#### POST

You can also use `POST` with queries.
When using `mutations` / `actions` you don't have to specify the method and the default will be `POST`

```ts
import { createCaller, response$ } from '@solid-mediakit/prpc'

export const postRequest = createCaller(
  () => {
    return response$({ iSetTheHeader: true }, { headers: { 'X-Testing': '1' } })
  },
  {
    method: 'POST',
  },
)

export const postRequest2 = createCaller(
  () => {
    return response$({ iSetTheHeader: true }, { headers: { 'X-Testing': '1' } })
  },
  {
    type: 'action',
  },
)
```

### Function Types

In addition to methods, you can also choose a function type (the function type will not affect the request method).

#### query

This is the default, you don't have to specify this:

```ts
import { createCaller } from '@solid-mediakit/prpc'

const thisIsAQuery = createCaller(() => {
  return 1
})

const alsoIsAQuery = createCaller(
  () => {
    return 1
  },
  {
    type: 'query',
  },
)

// client side
const query = thisIsAQuery()
query.data // number
```

#### mutation

You can either specify {type: 'action'} or use the `createAction` method

```ts
import { createCaller, createAction } from '@solid-mediakit/prpc'

const thisIsAMutation = createCaller(
  () => {
    return 1
  },
  {
    type: 'action',
  },
)

const alsoIsAMutation = createAction(() => {
  return 1
})

// client side
const mutation = thisIsAMutation()
mutation.mutate()
```

## .use

This method allows you create a reuseable caller that contains your middlewares.
You can combine multiple callers / middlewares and import them to different files, take a look at this example.

### file1.ts

In this file we create a caller with a custom middleware and then export it so it could be use in other files as-well.

```ts
import { createCaller } from '@solid-mediakit/prpc'

export const withMw1 = createCaller.use(() => {
  return {
    myFile1: 1,
  }
})

export const action1 = withMw1(({ ctx$ }) => {
  return `hey ${ctx$.myFile1} `
})
```

[This Transforms To](#transforms)

### file2.ts

In this file we can actually import the caller we created and then add more middlewares to it or use it as is.

```ts
import { withMw1 } from './file1'

export const withMw2 = withMw1.use(({ ctx$ }) => {
  return {
    ...ctx$,
    myFile2: 2,
  }
})

export const action2 = withMw2(({ ctx$ }) => {
  return `hey ${ctx$.myFile1} ${ctx$.myFile2}`
})
```

## Utils

pRPC contains many utils out of the box, like redirection, erroring, setting cookies, etc.

### redirect$

Use this function to **redirect the user** (this will not affect the function type):

```ts
import { createCaller, redirect$ } from '@solid-mediakit/prpc'

let redirect = false

export const myQuery = createCaller(() => {
  if (redirect) {
    return redirect$('/login')
  }
  return 'yes'
})
```

### error$

Use this function to **throw an error on the user side** (this will not affect the function type):

```ts
import { createCaller, error$ } from '@solid-mediakit/prpc'

let shouldError = false

export const myQuery = createCaller(() => {
  if (shouldError) {
    return error$$('Why did i error')
  }
  return 'yes'
})
```

### response$

Use this function to **return data & modify headers** (the return type is also infered from the data passed to response$):

```ts
import { createCaller, response$ } from '@solid-mediakit/prpc'

let setHeader = false

export const myQuery = createCaller(() => {
  if (setHeader) {
    return response$(1, {
      headers: { this: 'that' },
    })
  }
  return 'yes'
})

// respone type: number | string
```

### Optimistic Updates

Similiar to tRPC, each query function has a `useUtils` method, so lets say we import a server action we created using `createCaller` called `serverQuery1`

```ts
import { serverQuery1, serverMutation1 } from '~/server/etc'

const MyComponent = () => {
  const listPostQuery = serverQuery1()
  const serverQueryUtils = serverQuery1.useUtils()

  const postCreate = serverMutation1(() => ({
    async onMutate(newPost) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await serverQueryUtils.cancel()

      // Get the data from the queryCache
      const prevData = serverQueryUtils.getData()

      // Optimistically update the data with our new post
      serverQueryUtils.setData(undefined, (old) => [...old, newPost])

      // Return the previous data so we can revert if something goes wrong
      return { prevData }
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      serverQueryUtils.setData(undefined, ctx.prevData)
    },
    onSettled() {
      // Sync with server once mutation has settled
      serverQueryUtils.invalidate()
    },
  }))
}
```

## Setting up auth

As mentioned, you can choose to use either Clerk or AuthJS.

### Clerk

First Install The Dependencies

#### Install

```bash
pnpm install clerk-solidjs@latest
```

### Env Variables

Make sure to have this in your `.env`

```
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

#### Wrap Your App With ClerkProvider

`src/app.tsx` should be something like:

```tsx
// @refresh reload
import './app.css'
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { ClerkProvider } from 'clerk-solidjs'

export default function App() {
  const queryClient = new QueryClient()
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <ClerkProvider
            publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
          >
            <QueryClientProvider client={queryClient}>
              <Suspense>{props.children}</Suspense>
            </QueryClientProvider>
          </ClerkProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
```

#### Creating A Middleware

Head over to `src/middleware.ts` and make sure its something like:

```ts
import { createMiddleware } from '@solidjs/start/middleware'
import { clerkMiddleware } from 'clerk-solidjs/start/server'

export default createMiddleware({
  onRequest: [
    clerkMiddleware({
      publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    }),
  ],
})
```

### Modifying app.config.ts

This is it, you just need to modify `app.config.ts`

```ts
import { withPRPC } from '@solid-mediakit/prpc-plugin'

const config = withPRPC(
  {
    ssr: true,
  },
  {
    auth: 'clerk',
    authCfg: {
      middleware: './src/middleware.ts',
      protectedMessage: 'You need to sign in first',
    },
  },
)

export default config

declare module '@solid-mediakit/prpc' {
  interface Settings {
    config: typeof config
  }
}
```

### AuthJS

First Install The Dependencies

#### Install

```bash
pnpm install @auth/core@0.35.0 @solid-mediakit/auth@latest
```

### Env Variables

Make sure to have this in your `.env`

```
VITE_AUTH_PATH=/api/auth
DISCORD_ID=
DISCORD_SECRET=
```

#### Create Config

After installing, head over to `server/auth.ts` and create the AuthJS config:

```ts
import { type SolidAuthConfig } from '@solid-mediakit/auth'
import Discord from '@auth/core/providers/discord'

declare module '@auth/core/types' {
  export interface Session {
    user: {} & DefaultSession['user']
  }
}

export const authOpts: SolidAuthConfig = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET,
    }),
  ],
  debug: false,
  basePath: import.meta.env.VITE_AUTH_PATH,
}
```

### Create Auth API Endpoint

Go to `src/routes/api/auth/[...solidauth].ts`:

```ts
import { SolidAuth } from '@solid-mediakit/auth'
import { authOpts } from '~/server/auth'

export const { GET, POST } = SolidAuth(authOpts)
```

#### Wrap Your App With SessionProvider

`src/app.tsx` should be something like:

```tsx
// @refresh reload
import './app.css'
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { SessionProvider } from '@solid-mediakit/auth/client'

export default function App() {
  const queryClient = new QueryClient()
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <Suspense>{props.children}</Suspense>
            </QueryClientProvider>
          </SessionProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
```

### Modifying app.config.ts

This is it, you just need to modify `app.config.ts`

```ts
import { withPRPC } from '@solid-mediakit/prpc-plugin'

const config = withPRPC(
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

declare module '@solid-mediakit/prpc' {
  interface Settings {
    config: typeof config
  }
}
```

### QueryClientProvider

`src/app.tsx` should be something like:

```tsx
// @refresh reload
import './app.css'
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'

export default function App() {
  const queryClient = new QueryClient()
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <QueryClientProvider client={queryClient}>
            <Suspense>{props.children}</Suspense>
          </QueryClientProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
```

## Transforms

### file1

File1 Transforms To:

```ts
import { createCaller, callMiddleware$ } from '@solid-mediakit/prpc'

export const withMw1 = createCaller

export const action1 = createCaller(
  async ({ input$: _$$payload }) => {
    'use server'
    const ctx$ = await callMiddleware$(_$$event, _$$withMw1_mws)
    if (ctx$ instanceof Response) return ctx$
    return `hey ${ctx$.myFile1} `
  },
  {
    protected: false,
    key: 'action1',
    method: 'POST',
    type: 'query',
  },
)

export const _$$withMw1_mws = [
  () => {
    return {
      myFile1: 1,
    }
  },
]
```

### file2

File2 Transforms To:

````ts
import { createCaller, callMiddleware$ } from '@solid-mediakit/prpc'
import { withMw1, _$$withMw1_mws } from './file1'

export const withMw2 = withMw1

export const action2 = createCaller(
  async ({ input$: _$$payload }) => {
    'use server'
    const ctx$ = await callMiddleware$(_$$event, _$$withMw2_mws)
    if (ctx$ instanceof Response) return ctx$
    return `hey ${ctx$.myFile1} ${ctx$.myFile2}`
  },
  {
    protected: false,
    key: 'action2',
    method: 'POST',
    type: 'query',
  },
)

export const _$$withMw2_mws = [
  ..._$$withMw1_mws,
  ({ ctx$ }) => {
    return {
      ...ctx$,
      myFile2: 2,
    }
  },
]```
````
