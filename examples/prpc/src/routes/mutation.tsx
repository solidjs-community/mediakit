import { type VoidComponent } from 'solid-js'
import { A } from '@solidjs/router'
import { z } from 'zod'
import { mutation$ } from '~/prpc/mutation'

const testMutation = mutation$({
  mutationFn: ({ payload }) => {
    return `hey ${payload.hello}`
  },
  key: 'hello',
  schema: z.object({
    hello: z.string(),
  }),
})

const Home: VoidComponent = () => {
  const hello = testMutation()
  return (
    <main class='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <div class='container flex flex-col items-center justify-center gap-12 px-4 py-16 '>
        <h1 class='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
          Mutation
        </h1>
        <p class='text-2xl text-white'>{hello.data}</p>
      </div>
    </main>
  )
}

export default Home
