import {
  Match,
  Show,
  Switch,
  createSignal,
  type VoidComponent,
  Suspense,
} from 'solid-js'
import { createSession, signIn, signOut } from '@solid-mediakit/auth/client'
import { getRequestEvent } from 'solid-js/web'

const AuthShowcase1: VoidComponent = () => {
  const session = createSession()
  return (
    <div class='flex flex-col items-center justify-center gap-4'>
      <div>{JSON.stringify(session(), null, 2)}</div>
      <Show
        when={session().data}
        fallback={
          <button
            onClick={() => signIn('discord', { redirectTo: '/' })}
            class='rounded-full bg-black/50 px-10 py-3 font-semibold text-white no-underline transition hover:bg-black/70'
          >
            Sign in
          </button>
        }
      >
        {(session) => {
          return (
            <>
              <span class='text-xl text-black'>
                Hello there {session()?.user?.name}
              </span>
              <button
                onClick={() => signOut({ redirectTo: '/' })}
                class='rounded-full bg-black/50 px-10 py-3 font-semibold text-white no-underline transition hover:bg-black/70'
              >
                Sign out
              </button>
            </>
          )
        }}
      </Show>
    </div>
  )
}

const AuthShowcase: VoidComponent = () => {
  const session = createSession()
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  return (
    <div class='flex flex-col items-center justify-center gap-4'>
      <div>{JSON.stringify(session(), null, 2)}</div>
      <Switch>
        <Match when={session().status === 'authenticated'}>
          <button
            onClick={async () => {
              await signOut({ redirect: false })
            }}
            class='font-bold text-3xl text-red-500'
          >
            Sign Out
          </button>
        </Match>
        <Match when={session().status === 'unauthenticated'}>
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
                const r = await signIn('credentials', {
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
  )
}

const Home: VoidComponent = () => {
  return (
    <main class='flex flex-col items-center justify-center gap-4'>
      <span class='text-xl text-black'>Welcome to Solid Auth</span>
      <AuthShowcase />
    </main>
  )
}

export default Home
