import { getSession } from '@solid-mediakit/auth'
import { authOptions } from '~/server/auth'
import { useRouteData } from 'solid-start'
import { createServerData$ } from 'solid-start/server'
const Protected = () => {
  const _$rData = useRouteData<typeof routeData>()
  return <h1>protected route - {JSON.stringify(_$rData()?.session)}</h1>
}
export default Protected
export const routeData = () => {
  return createServerData$(async (_$_key, { request: _request }) => {
    const session = await getSession(_request, authOptions)
    console.log('session', session)
    return {
      session: session,
    }
  })
}
