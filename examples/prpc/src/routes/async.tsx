import { createAsync } from '@solidjs/router'
import { type VoidComponent } from 'solid-js'
import { redirectRequet } from '~/use/test2'

const Home: VoidComponent = () => {
  const hello1 = createAsync(() => redirectRequet.raw(), {
    deferStream: true,
  })

  return (
    <main class='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <div class='container flex flex-col items-center justify-center gap-12 px-4 py-16 '>
        <h1 class='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
          Query
        </h1>
        <p class='text-2xl text-white'>{JSON.stringify(hello1())}</p>
      </div>
    </main>
  )
}

export default Home
