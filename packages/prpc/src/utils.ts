import { ZodSchema } from 'zod'

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
