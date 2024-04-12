import { getSession } from '@solid-mediakit/auth'
import { cache, createAsync, redirect } from '@solidjs/router'
import { authOptions } from '~/server/auth'
import { Show } from 'solid-js'
import { getRequestEvent } from 'solid-js/web'

const getUser = cache(async () => {
  'use server'
  const event = getRequestEvent()!
  const session = await getSession(event.request, authOptions)
  if (!session) {
    throw redirect('/')
  }
  return session
}, 'user')

export const route = {
  load: () => getUser(),
}

export default function Protected() {
  const user = createAsync(() => getUser())
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
    </div>
  )
}
