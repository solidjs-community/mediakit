import { protected$ } from '@solid-mediakit/auth'

export default protected$((session$) => {
  return (
    <main>
      <h1>Protected Route</h1>
      <h1>hello {session$.user?.name}</h1>
    </main>
  )
})
