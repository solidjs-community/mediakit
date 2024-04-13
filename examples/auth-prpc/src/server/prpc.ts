import { builder$, error$ } from '@solid-mediakit/prpc'
import { authOptions } from './auth'
import { getSession } from '@solid-mediakit/auth'

export const helloBuilder = builder$()
  .middleware$(() => {
    return {
      hello: 1,
    }
  })
  .middleware$((ctx) => {
    return {
      ...ctx,
      world: 2,
    }
  })

export const userBuilder = builder$().middleware$(async ({ event$ }) => {
  const session = await getSession(event$.request, authOptions)
  if (!session) {
    return error$('Unauthorized', {
      status: 401,
    })
  }
  return session
})
