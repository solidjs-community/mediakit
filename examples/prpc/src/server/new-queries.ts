import { builder$ } from '@solid-mediakit/prpc'
import { z } from 'zod'

const myBuilder = builder$()
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

export const myNewQuery = myBuilder
  .input(
    z.object({
      hello: z.string(),
    })
  )
  .query$(({ payload, ctx$ }) => {
    if (payload.hello === 'hello') {
      return ctx$.hello
    }
    return ctx$.world
  }, 'myNewQuery')
