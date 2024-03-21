import { getRequestEvent } from 'solid-js/web'
import { cache } from '@solidjs/router'
import { validateZod } from '@solid-mediakit/prpc'
import { query$ } from '@solid-mediakit/prpc'
import { z } from 'zod'
const __$helloQuery = cache(async ({ payload: _$$payload }) => {
  'use server'
  const _$$validatedZod = await validateZod(
    _$$payload,
    z.object({
      hello: z.string(),
    })
  )
  if (_$$validatedZod instanceof Response) return _$$validatedZod
  const _$$event = getRequestEvent()!
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
const Home = () => {
  const hello = testQuery(() => ({
    hello: 'JDev',
  }))
  return (
    <main class='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <div class='container flex flex-col items-center justify-center gap-12 px-4 py-16 '>
        <h1 class='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
          Query
        </h1>
        <p class='text-2xl text-white'>{hello.data}</p>
      </div>
    </main>
  )
}
export default Home
