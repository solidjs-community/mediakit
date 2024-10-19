import { withMw1 } from './file1'
import { error$, redirect$ } from '@solid-mediakit/authpc'

const redirectOrError = 'redirect' as const

export const withMw2 = withMw1.use(({ ctx$ }) => {
  if (ctx$.myFile1 === 2) {
    if (redirectOrError === 'redirect') {
      return redirect$('/')
    } else {
      return error$('/')
    }
  }
  return {
    ...ctx$,
    myFile2: 2,
  }
})

export const action2 = withMw2(({ ctx$ }) => {
  return `hey ${ctx$.myFile1} ${ctx$.myFile2}`
})
