import { builder$, error$ } from '@solid-mediakit/prpc'
import { getAuthOptions } from './auth'
import { getSession } from '@solid-mediakit/auth'
import { isServer } from 'solid-js/web'

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
  console.log('this is called where?$')
  if (isServer) {
    const session = await getSession(event$.request, getAuthOptions())
    if (!session) {
      return error$('Unauthorized', {
        status: 401,
      })
    }
    return session
  } else {
    console.log('bbbb%%')
    throw new Error('this should only be called on the server')
  }
})
