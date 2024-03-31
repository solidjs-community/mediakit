import { z } from 'zod'
import { helloBuilder } from '../prpc'
import { error$ } from '@solid-mediakit/prpc'

export const helloMutation = helloBuilder
  .input(
    z.object({
      hello: z.string().min(1),
    })
  )
  .mutation$(({ payload, event$ }) => {
    if (payload.hello === 'error') {
      return error$('This is an error')
    } else if (payload.hello === 'cookie') {
      event$.response.headers.set('set-cookie', 'hello=world123123; path=/;')
    }
    return `hey ${payload.hello}`
  }, 'myNewMutation')
