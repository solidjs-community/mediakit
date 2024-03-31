import { middleware$, query$ } from '@solid-mediakit/prpc'
import { z } from 'zod'

const testMw = middleware$(() => {
  return 1
})

export const testQuery = query$({
  queryFn: async ({ payload }) => {
    return `hey ${payload.hello}`
  },
  key: 'hello',
  schema: z.object({
    hello: z.string(),
  }),
  middleware: [testMw],
})
