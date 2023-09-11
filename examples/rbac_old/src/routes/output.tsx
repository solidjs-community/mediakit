import { Show } from 'solid-js'
import { getSession } from '@solid-mediakit/auth'
import { authOptions } from '~/server/auth'
import { redirect } from 'solid-start'
import { createServerData$ } from 'solid-start/server'

const Protected = () => {
  const _$rData = createServerData$(async (_$_key, { request: _request }) => {
    const session = await getSession(_request, authOptions)
    if (!session) {
      throw redirect('/')
    }
    return {
      session: session,
    }
  })
  return (
    <Show when={_$rData()?.session}>
      <h1>protected routeddusibui - {JSON.stringify(_$rData()?.session)}</h1>
    </Show>
  )
}

export default Protected
