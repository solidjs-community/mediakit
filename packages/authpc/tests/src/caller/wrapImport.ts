import { importCaller } from './withImport'
import { myCaller } from './withMw'

export const wrappedImport = importCaller.use(({ ctx$ }) => {
  return {
    ...ctx$,
    lmao: 1,
  }
})

export const wrappedQuery = wrappedImport(
  async () => {
    return {
      ttt: 1,
    }
  },
  {
    method: 'GET',
  },
)

export const testCaller = myCaller.use(() => {
  return {
    delete: true,
  }
})

export const testQuery = testCaller(
  async () => {
    return {
      lll: 1,
    }
  },
  {
    method: 'GET',
  },
)
