import { createSignal, Show, type VoidComponent } from 'solid-js'
import { helloMutation } from '~/server/hello/hello.mutations'

const Home: VoidComponent = () => {
  const [hello, setHello] = createSignal('')
  const helloMut = helloMutation(() => ({
    onError(error) {
      if (error.isZodError()) {
        console.log('zod error:', error.cause.fieldErrors.hello)
      } else {
        console.log('not zod error', error.message)
      }
    },
  }))
  return (
    <main class='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <p class='text-2xl text-white'>{helloMut.data ?? 'No Data yet...'}</p>
      <Show when={helloMut.isError}>
        <p class='text-2xl text-red-500'>
          {helloMut.error?.message ?? 'Unknown Error'}
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
          onClick={() => helloMut.mutate({ hello: hello() })}
        >
          Submit
        </button>
      </div>
    </main>
  )
}

export default Home
