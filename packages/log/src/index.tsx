export const unwrapValue = <T,>(value: T | (() => T)): T => {
  return typeof value === 'function' ? (value as any)() : value
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function log$<T>(value: T): T {
  throw new Error('This should be compiled away')
}

export function print$<T>(value: T, line?: number, name?: string) {
  const strs: string[] = [value as string]
  const styles = ['color:magenta;']
  if (name) {
    strs.unshift(innerInfo(name))
    styles.unshift('color:orange;')
  }
  if (line) {
    strs.unshift(innerInfo(line, 'Line', name))
    styles.unshift('color:gray;')
  }
  const mainStr = strs.map((e) => `%c${e}`).join('')
  console.log(mainStr, ...styles)
}

const innerInfo = (
  value: string | number,
  name?: string,
  nextVal?: string | number
) => {
  const spacing = nextVal === undefined ? ' \t' : ' '
  if (name) {
    return `${name} ${value} ->${spacing}`
  }
  return `${value} ->${spacing}`
}
