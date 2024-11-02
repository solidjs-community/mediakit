import { ZodSchema } from 'zod'
import { MWFn$, RequiredAllowedSchemas } from './types'
import { RequestEvent } from 'solid-js/web'
import { CustomResponse, redirect } from '@solidjs/router'
import * as v from 'valibot'

export const isZodSchema = (
  schema: RequiredAllowedSchemas,
): schema is ZodSchema => '_def' in schema

export const validateSchema = async <Schema extends RequiredAllowedSchemas>(
  payload: string | object,
  schema: Schema,
) => {
  if (isZodSchema(schema)) {
    const res = await schema.safeParseAsync(
      typeof payload === 'object' ? payload : JSON.parse(payload),
    )
    if (!res.success) {
      return validationError$('zod', res.error.flatten())
    }
    return res.data
  }
  const res = await v.safeParseAsync(schema, payload)
  if (!res.success) {
    return validationError$('valibot', res.issues)
  }
  return res.output
}

export const redirect$ = (url: string, init?: ResponseInit) => {
  return redirect(url, init)
}

export const response$ = <T>(data: T, init?: ResponseInit): T => {
  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    init,
  ) as any
}

export const validationError$ = (
  provider: 'zod' | 'valibot',
  issues: object,
) => {
  return error$(
    {
      provider,
      issues,
    },
    {
      headers: { 'X-pRPC-Validation': '1' },
    },
  )
}

export const error$ = (
  error: any,
  init?: ResponseInit,
): CustomResponse<never> => {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('X-pRPC-Error', '1')
  return new Response(
    JSON.stringify({
      error: typeof error === 'string' ? { message: error } : error,
    }),
    {
      status: init?.status ?? 400,
      headers,
    },
  ) as any
}

export const callMiddleware$ = async <Mw extends MWFn$<any, any>[]>(
  event: RequestEvent,
  middlewares: Mw,
  ctx?: any,
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
