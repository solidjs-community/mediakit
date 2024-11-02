import { z } from 'zod'
import { createCaller, error$, response$ } from '@solid-mediakit/prpc'

export const withMws = createCaller
  .use(async () => {
    return {
      uno: 1,
    }
  })
  .use((input) => {
    return {
      ...input.ctx$,
      test: 1,
    }
  })

export const other = withMws.use(({ ctx$ }) => {
  return {
    ...ctx$,
    lll: 1,
  }
})

const qfn = other.use(({ ctx$ }) => {
  return {
    ...ctx$,
    test3: 1,
  }
})

export const q = qfn(
  z.object({ why: z.string() }),
  (r) => {
    return `hey ${r.input$.why}`
  },
  {
    key: 'custom-q',
    protected: true,
  },
)

export const getRequest = createCaller(
  z.object({ test: z.string() }),
  ({ input$ }) => {
    console.log('here', input$)
    return response$(
      { iSetTheHeader: true, testing: input$ },
      { headers: { 'cache-control': 'max-age=60' } },
    )
  },
  {
    method: 'GET',
  },
)

export const mutationTest3 = qfn(
  z.object({ ok: z.number(), test: z.object({ l: z.string() }) }),
  ({ input$ }) => {
    return error$('test')
    return `${input$.ok}`
  },
  {
    type: 'action',
  },
)
