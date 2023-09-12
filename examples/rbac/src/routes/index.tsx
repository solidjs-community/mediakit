import { Show, type VoidComponent, For, createEffect } from 'solid-js'
import { createSession, signIn, signOut } from '@solid-mediakit/auth/client'
import { Head, Title } from 'solid-start'
import { Can } from '../../../../packages/casl'
import { createServerAction$, createServerData$ } from 'solid-start/server'
import { getSession } from '@solid-mediakit/auth'
import { authOptions } from '~/server/auth'
import { subject } from '@casl/ability'
import { getAbilityFromSession } from '~/roles'
import { prisma } from '~/server/db'
import { accessibleBy } from '@casl/prisma'

const AuthShowcase: VoidComponent = () => {
  const session = createSession()

  return (
    <div class='flex flex-col items-center justify-center gap-4'>
      <TodoApp />
      <Show
        when={session()}
        fallback={
          <button
            onClick={() => signIn(undefined, { redirectTo: '/' })}
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

function TodoApp() {
  const todos = createServerData$(async (_, { request }) => {
    const session = await getSession(request, authOptions)
    const ability = getAbilityFromSession(session)
    console.log(ability)
    const todos = await prisma?.todos.findMany({
      where: accessibleBy(ability).Todos,
    })

    return todos
  })

  const [, addTodo] = createServerAction$(
    async (title: string, { request }) => {
      const session = await getSession(request, authOptions)
      const ability = getAbilityFromSession(session)

      const canCreate = ability.can('create', `Todo`)
      if (!canCreate) throw new Error(`Forbidden`)

      await prisma.todos.create({
        data: { title, completed: false, userId: session!.user.id },
      })
    }
  )

  const [, toggleTodo] = createServerAction$(
    async (id: string, { request }) => {
      const session = await getSession(request, authOptions)
      if (!session?.user.id) throw new Error('not signed in')

      const toUpdate = await prisma.todos.findUnique({ where: { id } })
      if (!toUpdate) throw new Error(`not found`)

      const ability = getAbilityFromSession(session)
      const canUpdate = ability.can('update', subject('Todo', toUpdate))
      if (!canUpdate) throw new Error(`Forbidden`)

      await prisma.todos.update({
        where: { id },
        data: { completed: !toUpdate.completed },
      })
    }
  )

  const [, removeTodo] = createServerAction$(
    async (id: string, { request }) => {
      const session = await getSession(request, authOptions)
      if (!session?.user.id) throw new Error('not signed in')

      const toUpdate = await prisma.todos.findUnique({ where: { id } })
      if (!toUpdate) throw new Error(`not found`)

      const ability = getAbilityFromSession(session)
      const canUpdate = ability.can('delete', subject('Todo', toUpdate))
      if (!canUpdate) throw new Error(`Forbidden`)

      await prisma.todos.delete({ where: { id } })
    }
  )
  createEffect(() => console.log({ todosE: todos.state }))
  return (
    <div class='bg-yellow-200 w-80 p-8'>
      <h1 class='text-center text-3xl'>todos</h1>
      <Can I='create' a='Todo' fallback={<></>}>
        <form
          class=''
          onSubmit={async (e) => {
            e.preventDefault()
            // @ts-expect-error hello
            const title = e.currentTarget.title.value

            await addTodo(title)
            e.currentTarget.reset()
          }}
        >
          <input
            type='text'
            name='title'
            placeholder='what are you upto?'
            class='w-full'
          />
        </form>
      </Can>
      <Can I='read' a='Todo' fallback={<>NOPE</>}>
        <div class='flex flex-col gap-2 my-2'>
          <Show
            when={todos()}
            fallback={
              <>
                {todos.state === 'errored'
                  ? 'error' + todos.error.message
                  : 'loading todos...'}
              </>
            }
          >
            <Show when={(todos()?.length ?? 0) < 1}>No todos</Show>
            <For each={todos()}>
              {(todo) => (
                <div class='flex gap-1'>
                  <Can I='update' a={subject('Todo', todo)} fallback={<></>}>
                    <input
                      type='checkbox'
                      checked={todo.completed ?? false}
                      onChange={() => toggleTodo(todo.id)}
                    />
                  </Can>
                  <span class={`${todo.completed ? 'line-through' : ''}`}>
                    {todo.title} ({todo.userId})
                  </span>
                  <div class='grow' />
                  <Can I='delete' a={subject('Todo', todo)} fallback={<></>}>
                    <button
                      class='bg-white px-1 rounded bg-opacity-70 hover:bg-opacity-100'
                      onClick={() => removeTodo(todo.id)}
                    >
                      X
                    </button>
                  </Can>
                </div>
              )}
            </For>
          </Show>
          <Show when={todos.error}>{todos.error}</Show>
        </div>
      </Can>
    </div>
  )
}
