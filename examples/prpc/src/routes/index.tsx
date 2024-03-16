import { type VoidComponent } from 'solid-js'
import { A } from '@solidjs/router'

const Home: VoidComponent = () => {
  return (
    <main class='flex min-h-screen gap-4  py-12 justify-center  bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <div class='flex flex-col gap-2 items-center border p-3 rounded-lg h-[100px]'>
        <h1 class='text-2xl font-bold text-gray-400'>CSR</h1>
        <div class='flex gap-2 items-center'>
          <A href='/query' class='text-2xl text-white'>
            Query
          </A>
          <span class='text-2xl text-white'>|</span>
          <A href='/mutation' class='text-2xl text-white'>
            Mutation
          </A>
        </div>
      </div>
      <div class='flex flex-col gap-2 items-center border p-3 rounded-lg h-[100px]'>
        <h1 class='text-2xl font-bold text-gray-400'>SSR</h1>
        <div class='flex gap-2 items-center'>
          <a href='/query' class='text-2xl text-white'>
            Query
          </a>
          <span class='text-2xl text-white'>|</span>
          <a href='/mutation' class='text-2xl text-white'>
            Mutation
          </a>
        </div>
      </div>
    </main>
  )
}

export default Home
