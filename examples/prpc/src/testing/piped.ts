import {
  middleware$,
  pipe$,
  query$,
  error$,
  hideRequest,
} from '@solid-mediakit/prpc'
import { z } from 'zod'

const myMiddleware1 = middleware$(({ event$ }) => {
  return Math.random() > 0.5 ? { test: true } : { test: null }
})

const middleWare2 = pipe$(myMiddleware1, (ctx) => {
  if (ctx.test === null) {
    return error$('test is null')
  }
  return {
    test: ctx.test,
    o: 1,
  }
})

export const add = query$({
  queryFn: ({ payload, ctx$ }) => {
    hideRequest(ctx$, true)
    console.log({ ctx$ })
    const result = payload.a + payload.b
    return { result }
  },
  key: 'add',
  schema: z.object({
    a: z.number().max(5),
    b: z.number().max(10),
  }),
  middleware: [middleWare2],
})

export const testQuery = query$({
  queryFn: async ({ payload, ctx$ }) => {
    hideRequest(ctx$, true)
    console.log({ ctx$ })
    return `hey ${payload.hello}`
  },
  key: 'hello',
  schema: z.object({
    hello: z.string(),
  }),
  middleware: [middleWare2],
})
