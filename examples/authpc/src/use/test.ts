import { z } from 'zod'
import { createAction, createCaller } from '@solid-mediakit/authpc'

const withCtx = createCaller.use(() => {
  const num = 1
  return {
    num,
  }
})

export const callTest = withCtx(
  z.object({
    test: z.string(),
  }),
  ({ input$, event$, session$, ctx$ }) => {
    console.log('user-agent', event$.request.headers.get('user-agent'))
    console.log('Welcome', session$.user?.name)
    console.log('ctx', ctx$)
    return `hey ${input$.test}`
  },
  {
    protected: true,
  },
)

export const mutationTest = createAction(() => {
  return 1
})
