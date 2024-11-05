import { type VoidComponent } from 'solid-js'
import { getRequest, mutationTest3 } from '~/use/use'
import '~/use/file1'
import '~/use/file2'

const Home: VoidComponent = () => {
  const hello1 = getRequest(() => ({ test: 'ok' }))
  const myMutation = mutationTest3(() => ({
    onSuccess(data, variables) {
      console.log(data, variables)
    },
  }))

  return (
    <main class='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <div class='container flex flex-col items-center justify-center gap-12 px-4 py-16 '>
        <h1 class='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
          Query
        </h1>
        <p class='text-2xl text-white'>{JSON.stringify(hello1.data)}</p>
        <button onClick={() => hello1.refetch()}>refetch</button>
        <p class='text-2xl text-white'>
          {myMutation.data ?? myMutation.status}
        </p>
        <button
          onClick={() => {
            try {
              myMutation.mutateAsync({ ok: 4, test: { l: 'test' } })
            } catch (e) {
              console.error('here', e)
            }
          }}
        >
          Call Mutation
        </button>
      </div>
    </main>
  )
}

export default Home
