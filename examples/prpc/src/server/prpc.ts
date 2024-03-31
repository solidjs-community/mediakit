import { builder$ } from '@solid-mediakit/prpc'

export const helloBuilder = builder$()
  .middleware(() => {
    return {
      hello: 1,
    }
  })
  .middleware((ctx) => {
    return {
      ...ctx,
      world: 2,
    }
  })
