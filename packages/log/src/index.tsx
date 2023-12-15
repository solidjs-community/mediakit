/* eslint-disable @typescript-eslint/no-explicit-any */
export { unwrapValue } from '@solid-mediakit/shared'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function log$<T>(value: T): T {
  throw new Error('This should be compiled away')
}
