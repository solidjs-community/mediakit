import { query$ } from '@solid-mediakit/prpc'
import { z } from 'zod'

export const testQuery = query$({
  queryFn: async ({ payload }) => {
    return `hey ${payload.hello}`
  },
  key: 'hello',
  schema: z.object({
    hello: z.string(),
  }),
})
