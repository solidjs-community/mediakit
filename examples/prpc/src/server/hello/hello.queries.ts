import { z } from 'zod'
import { helloBuilder } from '../prpc'

export const helloQuery = helloBuilder
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

export const helloQuery2 = helloBuilder.query$(() => {
  return 1
}, 'myNewQuery')
