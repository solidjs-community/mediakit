import { protected$ } from '@solid-mediakit/auth'
import { cache, createAsync } from '@solidjs/router'
import { Show, getRequestEvent } from 'solid-js/web'

const getSomething = cache(async () => {
  'use server'
  const event = getRequestEvent()!
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return event.request.headers.get('user-agent')!
}, 'something')

export const route = {
  load: () => getSomething(),
}

export default protected$(
  (session$) => {
    const something = createAsync(() => getSomething())
    return (
      <main>
        <h1>Protected Route</h1>
        <h1>hello {session$.user?.name}</h1>
        <Show when={something()}>
          {(us) => {
            return <span class='text-xl text-black'>{us()}</span>
          }}
        </Show>
      </main>
    )
  },
  () => <div>not logged in</div>
)
