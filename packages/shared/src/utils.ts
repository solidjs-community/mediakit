/* eslint-disable @typescript-eslint/no-explicit-any */
export const unwrapValue = <T>(value: T | (() => T)): T => {
  return typeof value === 'function' ? (value as any)() : value
}
