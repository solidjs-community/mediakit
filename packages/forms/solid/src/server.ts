import { getRequestEvent, isServer } from 'solid-js/web'
import { ZodSchema, infer as InferZodSchema } from 'zod'
import { MediakitClientError } from './error'
import { Setter } from 'solid-js'
import { $ZError } from './types'

export const validateZod = async <Schema extends ZodSchema>(
  payload: any,
  schema: Schema,
) => {
  const res = await schema.safeParseAsync(
    typeof payload === 'object' ? payload : JSON.parse(payload),
  )
  if (!res.success) {
    return error$(res.error.flatten())
  }
  return res.data
}

export const error$ = (error: any, init?: ResponseInit): Response => {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('X-Mediakit-Error', '1')
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
export const genHandleResponse = () => {
  const event = getRequestEvent()
  return (response: Response) => {
    if (isServer && event) {
      if ((event as any).response) {
        response.headers.forEach((value, key) => {
          if (key === 'content-type') return
          ;(event as any).response.headers.set(key, value)
        })
      }
    }
  }
}

export const callServerFn = async <
  Schema extends ZodSchema,
  R = InferZodSchema<Schema>,
>(
  values: R,
  onSubmit: ((input: R) => any) | ((p: { payload: R }) => any),
  setFieldErrors: Setter<$ZError<Schema> | null>,
  setError: Setter<MediakitClientError<Schema> | null>,
  handleResponse = genHandleResponse(),
) => {
  try {
    const response = await (onSubmit as unknown as (p: { payload: R }) => any)({
      payload: values,
    })
    if (response instanceof Response) {
      handleResponse?.(response)
      const url = response.headers.get('location')
      if (response.headers.get('X-Mediakit-Error') === '1') {
        const error = await optionalData(response)
        throw new MediakitClientError(error.error.message, error.error)
      } else if (!isRedirectResponse(response) || !url) {
        return await optionalData(response)
      }
    }
    return response
  } catch (e: any) {
    const newE =
      e instanceof MediakitClientError
        ? e
        : new MediakitClientError(e?.message ?? 'Unknown error', e)
    if (newE.isZodError()) {
      setFieldErrors(e.cause.fieldErrors)
    }
    setError(newE)
  }
}

const redirectStatusCodes = new Set([204, 301, 302, 303, 307, 308])

export function isRedirectResponse(response: Response): response is Response {
  return (
    response &&
    response instanceof Response &&
    redirectStatusCodes.has(response.status)
  )
}

export const optionalData = async (response: Response) => {
  try {
    return await response.clone().json()
  } catch {
    return await response.clone().text()
  }
}
