import { createCaller } from '@solid-mediakit/prpc'
export const myCaller = createCaller
export const _$$myCaller_mws = [
  ({ event$ }) => {
    return {
      ua: event$.request.headers.get('user-agent'),
    }
  },
]
