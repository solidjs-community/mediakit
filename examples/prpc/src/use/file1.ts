import { createCaller } from '@solid-mediakit/prpc'

export const withMw1 = createCaller.use(() => {
  return {
    myFile1: 1,
  }
})

export const action1 = withMw1(({ ctx$ }) => {
  return `hey ${ctx$.myFile1} `
})
