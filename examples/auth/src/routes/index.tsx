import {
  Match,
  Switch,
  createSignal,
  type VoidComponent,
  Show,
  createEffect,
  on,
} from 'solid-js'
import { useAuth } from '@solid-mediakit/auth/client'
import { getRequestEvent } from 'solid-js/web'
import { cache, createAsync } from '@solidjs/router'
import { getSession } from '@solid-mediakit/auth'
import { authOptions } from '~/server/auth'
import { setContext } from 'vinxi/server'

const getSomething = cache(async () => {
  'use server'
  await new Promise((res) => setTimeout(res, 3000))
  const event = getRequestEvent()!
  setContext('session', await getSession(event.request, authOptions))
  // event.locals.session = await getSession(event.request, authOptions)
  return 1
}, 'something2')

export const route = {
  load: () => getSomething(),
}

const AuthShowcase2: VoidComponent = () => {
  const r = createAsync(() => getSomething())
  const auth = useAuth()
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')

  return (
    <Show when={r()}>
      <div class='flex flex-col items-center justify-center gap-4'>
        <div>
          {JSON.stringify(
            {
              status: auth.status(),
              session: auth.session(),
            },
            null,
            2,
          )}
        </div>
        <Switch fallback={<div>Loading...</div>}>
          <Match when={auth.status() === 'authenticated'}>
            <button
              onClick={async () => {
                await auth.signOut({ redirect: false })
              }}
              class='font-bold text-3xl text-red-500'
            >
              Sign Out
            </button>
          </Match>
          <Match when={auth.status() === 'unauthenticated'}>
            <div class='flex flex-col gap-4 itesms-center'>
              <input
                type='text'
                value={email()}
                placeholder='Email'
                onInput={(e) => setEmail(e.currentTarget.value)}
                class='outline-none bg-zinc-700 rounded-lg p-3 text-white text-lg font-bold'
              />
              <input
                type='password'
                value={password()}
                placeholder='Password'
                onInput={(e) => setPassword(e.currentTarget.value)}
                class='outline-none bg-zinc-700 rounded-lg p-3 text-white text-lg font-bold'
              />
              <button
                onClick={async () => {
                  const r = await auth.signIn('credentials', {
                    redirect: false,
                    email: email(),
                    password: password(),
                  })
                  console.log('here', r)
                }}
                class='font-bold text-3xl text-green-500'
              >
                Sign In
              </button>
            </div>
          </Match>
        </Switch>
      </div>
    </Show>
  )
}

const Home: VoidComponent = () => {
  return (
    <main class='flex flex-col items-center justify-center gap-4'>
      <span class='text-xl text-black'>Welcome to Solid Auth</span>
      <AuthShowcase2 />
    </main>
  )
}

export default Home

const AuthShowcase: VoidComponent = () => {
  const auth = useAuth()
  return (
    <div class='flex flex-col items-center justify-center gap-4'>
      <Switch fallback={<div>Loading...</div>}>
        <Match when={auth.status() === 'authenticated'}>
          <div class='flex flex-col gap-3'>
            <span class='text-xl text-white'>
              Welcome {auth.session()?.user?.name}
            </span>
            <button
              onClick={() => auth.signOut({ redirectTo: '/' })}
              class='rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20'
            >
              Sign out
            </button>
          </div>
        </Match>
        <Match when={auth.status() === 'unauthenticated'}>
          <button
            onClick={() => auth.signIn('discord', { redirectTo: '/' })}
            class='rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20'
          >
            Sign in
          </button>
        </Match>
      </Switch>
    </div>
  )
}
const styles = {} as any

const AuthShowcase3: VoidComponent = () => {
  const auth = useAuth()
  return (
    <div class={styles.authContainer}>
      <Switch fallback={<div>Loading...</div>}>
        <Match when={auth.status() === 'authenticated'}>
          <span class={styles.showcaseText}>
            Welcome {auth.session()?.user?.name}
          </span>
          <button
            onClick={() => auth.signOut({ redirectTo: '/' })}
            class={styles.loginButton}
          >
            Sign out
          </button>
        </Match>
        <Match when={auth.status() === 'unauthenticated'}>
          <button
            onClick={() => auth.signIn('discord', { redirectTo: '/' })}
            class={styles.loginButton}
          >
            Sign in
          </button>
        </Match>
      </Switch>
    </div>
  )
}
