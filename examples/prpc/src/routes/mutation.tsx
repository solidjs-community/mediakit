import { createSignal, Show, type VoidComponent } from 'solid-js'
import { testMutation } from '~/server/old/mutation'
import { testQuery2 } from '~/server/old/queries'

const Home: VoidComponent = () => {
  const [hello, setHello] = createSignal('')
  const utils = testQuery2.useUtils()

  const helloMutation = testMutation(() => ({
    async onSuccess() {
      await utils.invalidate()
    },
    onError(error) {
      if (error.isZodError()) {
        console.log('zod error:', error.cause.fieldErrors)
      } else {
        console.log('not zod error', error.message)
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

export default Home
