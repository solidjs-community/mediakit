import { ZodSchema } from 'zod'
import { FilterOutResponse, IMiddleware, InferFinalMiddlware } from './types'

export const validateZod = async <Schema extends ZodSchema>(
  payload: any,
  schema: Schema
) => {
  const res = await schema.safeParseAsync(
    typeof payload === 'object' ? payload : JSON.parse(payload)
  )
  if (!res.success) {
    return error$(res.error.flatten())
  }
  return res.data
}

export const error$ = (error: any, init?: ResponseInit): Response => {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('X-Prpc-Error', '1')
  headers.set('X-Prpc-Validation', '1')
  return new Response(
    JSON.stringify({
      error: typeof error === 'string' ? { message: error } : error,
    }),
    {
      status: init?.status ?? 400,
      headers,
    }
  ) as any
}

export const middleware$ = <
  Mw extends IMiddleware<CurrentContext>,
  CurrentContext = unknown
>(
  mw: Mw
): Mw => {
  return mw
}

type Flattened<T> = T extends Array<infer U> ? Flattened<U> : T

export const pipe$ = <
  CurrentMw extends IMiddleware<any> | IMiddleware<any>[],
  Mw extends IMiddleware<FilterOutResponse<InferFinalMiddlware<CurrentMw>>>[]
>(
  currentMw: CurrentMw,
  ...middlewares: Mw
): Flattened<Mw> => {
  if (Array.isArray(currentMw)) {
    return [...currentMw, ...middlewares].flat() as any
  }
  return [currentMw, ...middlewares].flat() as any
}

export const hideEvent = <T>(ctx$: T, fully?: boolean) => {
  if (typeof ctx$ === 'object' && ctx$ !== null && 'event$' in ctx$) {
    if (fully) {
      delete (ctx$ as any).event$
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { event$: _$ignore, ...rest } = ctx$ as any
      return rest
    }
  }
  return ctx$
}

export const hideRequest = <T>(ctx$: T, fully?: boolean) => {
  if (typeof ctx$ === 'object' && ctx$ !== null && 'event$' in ctx$) {
    if (fully) {
      delete (ctx$ as any).event$
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { event$: _$ignore, ...rest } = ctx$ as any
      return rest
    }
  }
  return ctx$
}
