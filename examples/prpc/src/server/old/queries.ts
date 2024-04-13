import { error$, middleware$, pipe$, query$ } from '@solid-mediakit/prpc'
import { z } from 'zod'

const testMw = middleware$(() => {
  console.log('called a')
  return {
    b: 1,
  }
})

const testMw2 = pipe$(testMw, (ctx) => {
  console.log('called b')
  return {
    ...ctx,
    c: 2,
  }
})

export const testQuery = query$({
  queryFn: async ({ payload, ctx$, event$ }) => {
    console.log(event$.request.headers.get('user-agent'))
    return `hey ${payload.hello} ${ctx$.b} ${ctx$.c}`
  },
  key: 'hello',
  schema: z.object({
    hello: z.string(),
  }),
  middleware: testMw2,
})
