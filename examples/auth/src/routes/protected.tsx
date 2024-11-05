import { getSession } from '@solid-mediakit/auth'
import { query, createAsync, redirect } from '@solidjs/router'
import { authOptions } from '~/server/auth'
import { Show } from 'solid-js'
import { getRequestEvent } from 'solid-js/web'

const getUser = query(async () => {
  'use server'
  const event = getRequestEvent()!
  const session = await getSession(event.request, authOptions)
  if (!session) {
    throw redirect('/')
  }
  return session
}, 'user')

const getSomething = query(async () => {
  'use server'
  const event = getRequestEvent()!
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return event.request.headers.get('user-agent')!
}, 'something')

export const route = {
  load: () => [getUser(), getSomething()],
}

export default function Protected() {
  const user = createAsync(() => getUser())
  const something = createAsync(() => getSomething())
  return (
    <div class='flex flex-col items-center justify-center gap-4'>
      <span class='text-xl text-black'>Welcome to Solid Auth</span>
      <Show when={user()}>
        {(us) => {
          return (
            <span class='text-xl text-black'>
              Hello there {us().user?.name}
            </span>
          )
        }}
      </Show>
      <Show when={something()}>
        {(us) => {
          return <span class='text-xl text-black'>{us()}</span>
        }}
      </Show>
    </div>
  )
}
