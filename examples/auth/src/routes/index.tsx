import { Show, type VoidComponent } from 'solid-js'
import { createSession, signIn, signOut } from '@solid-mediakit/auth/client'
import { getRequestEvent } from 'solid-js/web'

const AuthShowcase1: VoidComponent = () => {
  const session = createSession()
  return (
    <div class='flex flex-col items-center justify-center gap-4'>
      <div>{JSON.stringify(session(), null, 2)}</div>
      <Show
        when={session().session}
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

  return (
    <div class='flex flex-col items-center justify-center gap-4'>
      <div>{JSON.stringify(session(), null, 2)}</div>
      <Show
        when={session().status === 'loading'}
        fallback={
          <div
            onClick={async () => {
              if (session().status === 'authenticated') {
                await signOut({ redirect: false })
              } else {
                const r = await signIn('credentials', {
                  redirect: false,
                  email: 'test',
                  password: 'test',
                })
              }
            }}
          >
            {session().status === 'authenticated' ? 'ok' : 'not ok'}
          </div>
        }
      >
        <div>loading</div>
      </Show>
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
