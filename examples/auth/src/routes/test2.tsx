import { protected$ } from '@solid-mediakit/auth'

export default protected$(
  () => {
    return (
      <main>
        <h1>Hidden for logged in</h1>
      </main>
    )
  },
  undefined,
  true,
)
