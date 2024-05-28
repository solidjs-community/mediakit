export {}

declare global {
  interface NodeJS {
    global: {
      _$DEBUG: (...args: unknown[]) => unknown
    }
  }
}

export * from '@trpc/client'
export {
  createTRPCSolidStart,
  type CreateTRPCSolidStart,
} from './createTRPCSolid'
export { createSolidQueryHooks } from './interop'
export { UseTRPCQueryResult } from "./shared/hooks/createHooksInternal";