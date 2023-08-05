import { Show, type VoidComponent } from 'solid-js'
import { createSession, signIn, signOut } from '@solid-mediakit/auth/client'
import { Head, Title } from 'solid-start'

const AuthShowcase: VoidComponent = () => {
  const session = createSession()
  return (
    <div class='flex flex-col items-center justify-center gap-4'>
      <Show
        when={session()}
        fallback={
          <button
            onClick={() => signIn('discord', { redirectTo: '/' })}
            class='rounded-full bg-black/50 px-10 py-3 font-semibold text-white no-underline transition hover:bg-black/70'
          >
            Sign in
          </button>
        }
      >
        <span class='text-xl text-black'>
          Hello there {session()?.user?.name}
        </span>
        <button
          onClick={() => signOut({ redirectTo: '/' })}
          class='rounded-full bg-black/50 px-10 py-3 font-semibold text-white no-underline transition hover:bg-black/70'
        >
          Sign out
        </button>
      </Show>
    </div>
  )
}

const Home: VoidComponent = () => {
  return (
    <>
      <Head>
        <Title>Home</Title>
      </Head>
      <main class='flex flex-col items-center justify-center gap-4'>
        <span class='text-xl text-black'>Welcome to Solid Auth</span>
        <AuthShowcase />
      </main>
    </>
  )
}

export default Home
