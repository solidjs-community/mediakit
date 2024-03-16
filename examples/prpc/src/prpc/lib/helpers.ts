export const makeKey = (
  type: 'query' | 'mutation',
  key: string,
  input?: any
) => {
  if (type === 'mutation') {
    return ['prpc.mutation', key]
  }
  return ['prpc.query', key, input]
}

export const unwrapValue = (value: any) => {
  if (typeof value === 'function') {
    return { payload: value() }
  }
  return { payload: value }
}
