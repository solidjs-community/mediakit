import { myCaller, _$$myCaller_mws } from './withMw'
export const importCaller = myCaller
export const _$$importCaller_mws = [
  ..._$$myCaller_mws,
  ({ ctx$ }) => {
    return {
      ...ctx$,
      test: 1,
    }
  },
]
