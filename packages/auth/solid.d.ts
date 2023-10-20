export {}

declare global {
  const _$DEBUG: (...args: unknown[]) => unknown
  const _$HY: {
    morph: (...args: unknown[]) => unknown
  }
  export interface Window {
    _$HY: {
      morph: (...args: unknown[]) => unknown
    }
  }
}
