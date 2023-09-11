import { Show, type VoidComponent, For } from 'solid-js'
import { createSession, signIn, signOut } from '@solid-mediakit/auth/client'
import { Head, Title } from 'solid-start'
import { Can } from '../../../../packages/casl'
import { createServerAction$, createServerData$ } from 'solid-start/server'
import { type Todo, Todos } from '~/server/db'
import { getSession } from '@solid-mediakit/auth'
import { authOptions } from '~/server/auth'
import { subject } from '@casl/ability'
import { rulesToQuery } from '@casl/ability/extra'
import { getAbilityFromSession } from '~/roles'

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
    if (!session?.id) return []

    const ability = getAbilityFromSession(session)
    const canRead = ability.can('read', `Todo`)
    if (!canRead) throw new Error(`Forbidden`)

    const q = rulesToQuery(ability, 'read', 'Todo', (r) => r.conditions || [])
    const allTodos = await Todos.get()
    const filtered =
      q?.$or?.reduce<Todo[]>(
        (results, { userId }) => results.filter((t) => t.userId === userId),
        allTodos
      ) || allTodos

    return filtered
  })

  const [, addTodo] = createServerAction$(
    async (title: string, { request }) => {
      const session = await getSession(request, authOptions)
      if (!session?.id) throw new Error('not signed in')

      const ability = getAbilityFromSession(session)
      const canCreate = ability.can('create', `Todo`)
      if (!canCreate) throw new Error(`Forbidden`)

      const todos = await Todos.get()
      await Todos.save([
        ...todos,
        { title, completed: false, userId: session.id },
      ])
    }
  )

  const [, toggleTodo] = createServerAction$(
    async (idx: number, { request }) => {
      const session = await getSession(request, authOptions)
      if (!session?.id) throw new Error('not signed in')

      const todos = await Todos.get()
      const toUpdate = todos.find((t, i) => i === idx)
      if (!toUpdate) throw new Error(`not found`)

      const ability = getAbilityFromSession(session)
      const canCreate = ability.can('update', subject('Todo', toUpdate))
      if (!canCreate) throw new Error(`Forbidden`)

      await Todos.save(
        todos.map((t, i) => (i === idx ? { ...t, completed: !t.completed } : t))
      )
    }
  )

  const [, removeTodo] = createServerAction$(
    async (idx: number, { request }) => {
      const session = await getSession(request, authOptions)
      if (!session?.id) throw new Error('not signed in')

      const todos = await Todos.get()
      const toDelete = todos.find((t, i) => i === idx)
      if (!toDelete) throw new Error(`not found`)

      const ability = getAbilityFromSession(session)
      const canDelete = ability.can('delete', subject('Todo', toDelete))
      if (!canDelete) throw new Error(`Forbidden`)

      await Todos.save(todos.filter((t, i) => i !== idx))
    }
  )

  return (
    <div class='bg-yellow-200 w-80 p-8'>
      <h1 class='text-center text-3xl'>todos</h1>
      <Can I='add' a='Todo' fallback={<></>}>
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
          <Show when={todos()} fallback={<>Loading todos...</>}>
            <Show when={(todos()?.length ?? 0) < 1}>No todos</Show>
            <For each={todos()}>
              {(todo, i) => (
                <div class='flex gap-1'>
                  <Can I='update' a={subject('Todo', todo)} fallback={<></>}>
                    <input
                      type='checkbox'
                      checked={todo.completed ?? false}
                      onChange={() => toggleTodo(i())}
                    />
                  </Can>
                  <span class={`${todo.completed ? 'line-through' : ''}`}>
                    {todo.title} ({todo.userId})
                  </span>
                  <div class='grow' />
                  <Can I='delete' a={subject('Todo', todo)} fallback={<></>}>
                    <button
                      class='bg-white px-1 rounded bg-opacity-70 hover:bg-opacity-100'
                      onClick={() => removeTodo(i())}
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
