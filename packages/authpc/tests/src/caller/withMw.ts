import { createCaller } from '@solid-mediakit/authpc'

export const myCaller = createCaller.use(({ event$ }) => {
  return {
    ua: event$.request.headers.get('user-agent'),
  }
})
