import { myCaller } from './withMw'

export const importCaller = myCaller.use(({ ctx$ }) => {
  return {
    ...ctx$,
    test: 1,
  }
})
