import { getSession } from '@solid-mediakit/auth'
import { cache, createAsync } from '@solidjs/router'
import { type VoidComponent } from 'solid-js'
import { getRequestEvent } from 'solid-js/web'
import { authOptions } from '~/server/auth'

const getPlayers = cache(async function () {
  'use server'
  let request = getRequestEvent()!
  let session = await getSession(request, authOptions)

  return session == null ? 'invalid' : JSON.stringify(session)
}, 'test')

const Home: VoidComponent = () => {
  const user = createAsync(() => getPlayers())

  return (
    <main class='flex flex-col items-center justify-center gap-4'>
      <span class='text-xl text-black'>Welcome to Solid Auth</span>
      <pre>{user()}</pre>
    </main>
  )
}

export default Home
