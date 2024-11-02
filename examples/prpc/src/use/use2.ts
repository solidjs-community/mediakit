import { withMws } from './use'

const okefgsdg = withMws.use((current) => {
  return {
    ...current,
    lll: 3,
  }
})

export const q2 = okefgsdg(
  () => {
    return 1
  },
  {
    key: 'q2',
  },
)
