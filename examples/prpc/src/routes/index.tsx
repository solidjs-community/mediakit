import { type VoidComponent } from 'solid-js'
import { A } from '@solidjs/router'

const Home: VoidComponent = () => {
  return (
    <main class='flex min-h-screen gap-4  py-12 justify-center  bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <A href='/query' class='text-2xl text-white'>
        Query
      </A>
      <span class='text-2xl text-white'>|</span>
      <A href='/mutation' class='text-2xl text-white'>
        Mutation
      </A>
    </main>
  )
}

export default Home
