import { error$, mutation$ } from '@solid-mediakit/prpc'
import { z } from 'zod'

export const testMutation = mutation$({
  mutationFn: ({ payload, event$ }) => {
    const ua = event$.request.headers.get('user-agent')
    console.log({ ua })
    if (payload.hello === 'error') {
      return error$('This is an error')
    } else if (payload.hello === 'cookie') {
      event$.response.headers.set('set-cookie', 'hello=world123123; path=/;')
    }
    return `hey ${payload.hello}`
  },
  key: 'hello',
  schema: z.object({
    hello: z.string(),
  }),
})
