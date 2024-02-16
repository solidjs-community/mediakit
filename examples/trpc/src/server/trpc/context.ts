import { createSolidAPIHandlerContext } from '@solid-mediakit/trpc/handler'
import type { inferAsyncReturnType } from '@trpc/server'

export const createContextInner = async (
  opts: createSolidAPIHandlerContext
) => {
  return {
    ...opts,
  }
}

export const createContext = async (opts: createSolidAPIHandlerContext) => {
  return await createContextInner(opts)
}

export type IContext = inferAsyncReturnType<typeof createContext>
