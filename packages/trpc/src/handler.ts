import { HTTPRequest, resolveHTTPResponse } from '@trpc/server/http'
import {
  type AnyRouter,
  type inferRouterContext,
  TRPCError,
} from '@trpc/server'
import { type ResponseMetaFn } from '@trpc/server/dist/http/internals/types'
import { TRPCErrorResponse } from '@trpc/server/rpc'

export function getPath(args: {
  params: { [key: string]: string }
}): string | null {
  const p: any = args.params.trpc
  if (typeof p === 'string') {
    return p
  }
  if (Array.isArray(p)) {
    return p.join('/')
  }
  return null
}

export function notFoundError<TRouter extends AnyRouter>(
  opts: ICreateSolidAPIHandlerOpts<TRouter>
) {
  const error = opts.router.getErrorShape({
    error: new TRPCError({
      message:
        'Query "trpc" not found - is the file named `[trpc]`.ts or `[...trpc].ts`?',
      code: 'INTERNAL_SERVER_ERROR',
    }),
    type: 'unknown',
    ctx: undefined,
    path: undefined,
    input: undefined,
  })
  const json: TRPCErrorResponse = {
    id: -1,
    error,
  }
  return new Response(JSON.stringify(json), { status: 500 })
}

export type createSolidAPIHandlerContext = {
  req: Request
  res: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: Record<string, any>
  }
}
export type CreateContextFn<TRouter extends AnyRouter> = (
  ctx: createSolidAPIHandlerContext
) => inferRouterContext<TRouter> | Promise<inferRouterContext<TRouter>>

export type ICreateProps<TRouter extends AnyRouter> = {
  router: TRouter
  createContext: CreateContextFn<TRouter>
}

export type ICreateSolidAPIHandlerOpts<TRouter extends AnyRouter> = {
  router: TRouter
  createContext: CreateContextFn<TRouter>
  responseMeta?: ResponseMetaFn<TRouter>
}

export function createSolidAPIHandler<TRouter extends AnyRouter>(
  opts: ICreateSolidAPIHandlerOpts<TRouter>
) {
  const handler = async (args: any) => {
    const path = getPath(args)
    if (path === null) {
      return notFoundError(opts)
    }
    const res: createSolidAPIHandlerContext['res'] = {
      headers: {},
    }
    const url = new URL(args.request.url)
    const req: HTTPRequest = {
      query: url.searchParams,
      method: args.request.method,
      headers: Object.fromEntries(args.request.headers),
      body: await args.request.text(),
    }
    const result = await resolveHTTPResponse({
      router: opts.router,
      responseMeta: opts.responseMeta,
      req,
      path,
      createContext: async () =>
        await opts.createContext?.({
          req: args.request,
          res,
        }),
    })
    const mRes = new Response(result.body, {
      status: result.status,
    })
    for (const [key, value] of Object.entries(
      result.headers ? { ...res.headers, ...result.headers } : res.headers
    )) {
      if (typeof value === 'undefined') {
        continue
      }
      if (typeof value === 'string') {
        mRes.headers.set(key, value)
        continue
      }
      for (const v of value) {
        mRes.headers.append(key, v)
      }
    }
    return mRes
  }
  return {
    GET: handler,
    POST: handler,
  }
}
