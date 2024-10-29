import { myCaller } from './withMw'
import { wrappedImport } from './wrapImport'

export const wrappedImport2 = wrappedImport.use(() => {
  return {
    lol: true,
  }
})
export const wrappedImport3 = wrappedImport2.use(({ ctx$ }) => {
  return {
    ...ctx$,
    lmao: 1,
  }
})

export const wrappedQuery3 = wrappedImport3(
  async () => {
    return {
      ttt: 1,
    }
  },
  {
    method: 'GET',
  },
)

export const wrappedQuery2 = wrappedImport2(
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
