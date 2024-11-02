import { createCaller } from '@solid-mediakit/prpc'

export const myCaller = createCaller.use(({ event$ }) => {
  return {
    ua: event$.request.headers.get('user-agent'),
  }
})
