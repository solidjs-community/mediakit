import {
  FilterOutResponse,
  IMiddleware,
  InferFinalMiddlware,
  PRPCEvent,
} from './types'

export const middleware$ = <
  Mw extends IMiddleware<CurrentContext>,
  CurrentContext = unknown
>(
  mw: Mw
): Mw => {
  return mw
}

export const callMiddleware$ = async <Mw extends IMiddleware<any>[]>(
  event: PRPCEvent,
  middlewares: Mw,
  ctx?: any
) => {
  let currentCtx = ctx ? { ...ctx, event$: event } : { event$: event }
  if (Array.isArray(middlewares)) {
    for (const middleware of middlewares) {
      if (Array.isArray(middleware)) {
        currentCtx = await callMiddleware$(event, middleware, currentCtx)
        if (currentCtx instanceof Response) {
          return currentCtx
        }
      } else {
        currentCtx = await middleware({ event$: event, ...currentCtx })
        if (currentCtx instanceof Response) {
          return currentCtx
        }
      }
    }
    return currentCtx
  } else {
    return await (middlewares as any)({
      event$: event,
      ...ctx,
    })
  }
}

export const pipe$ = <
  CurrentMw extends IMiddleware<any> | IMiddleware<any>[],
  Mw extends IMiddleware<FilterOutResponse<InferFinalMiddlware<CurrentMw>>>[]
>(
  currentMw: CurrentMw,
  ...middlewares: Mw
): Mw => {
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
