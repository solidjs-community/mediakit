import { createCaller, error$ } from '@solid-mediakit/prpc'
import { authOptions } from './auth'
import { getSession } from '@solid-mediakit/auth'
export const helloCaller = createCaller
export const userCaller = createCaller
export const _$$helloCaller_mws = [
  () => {
    return {
      hello: 1,
    }
  },
  ({ ctx$ }) => {
    return {
      ...ctx$,
      world: 2,
    }
  },
]
export const _$$userCaller_mws = [
  async ({ event$ }) => {
    const session = await getSession(event$.request, authOptions)
    if (!session) {
      return error$('Unauthorized', {
        status: 401,
      })
    }
    return session
  },
]
