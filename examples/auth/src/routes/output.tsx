import { Show } from 'solid-js'
import { getSession } from '@solid-mediakit/auth'
import { authOptions } from '~/server/auth'
import { useRouteData, redirect } from 'solid-start'
import { createServerData$ } from 'solid-start/server'
const Protected = () => {
  const _$rData = useRouteData<typeof routeData>()
  return (
    <Show when={_$rData()?.session}>
      <h1>protected route - {JSON.stringify(_$rData()?.session)}</h1>
    </Show>
  )
}
export default Protected
export const routeData = () => {
  return createServerData$(async (_$_key, { request: _request }) => {
    console.log('called routeData')
    const session = await getSession(_request, authOptions)
    console.log('session', session)
    if (!session) {
      throw redirect('/')
    }
    return {
      session: session,
    }
  })
}
