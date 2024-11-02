import { getRequestEvent, isServer } from 'solid-js/web'
import { PRPClientError } from './error'
import { ExpectedFn$ } from './types'

export async function wrapFn<Fn extends ExpectedFn$<any, any>>(
  callFn: Fn,
  input: any,
  method: 'GET' | 'POST',
  handleResponse = genHandleResponse(),
) {
  const input$ = input
    ? typeof input === 'function'
      ? input()
      : input
    : undefined
  try {
    const response = await callFn(
      method === 'GET' ? (JSON.stringify(input$) as any) : { input$ },
    )
    if (response instanceof Response) {
      handleResponse?.(response)
      const url = response.headers.get('location')
      if (response.headers.get('X-pRPC-Error') === '1') {
        const isValidationError =
          response.headers.get('X-pRPC-Validation') === '1'
        const error = await optionalData(response)
        throw new PRPClientError(
          error.error.message,
          isValidationError ? error.error.issues : error.error,
          isValidationError,
        )
      } else if (!isRedirectResponse(response) || !url) {
        return await optionalData(response)
      }
    }
    return response
  } catch (e: any) {
    if (e instanceof PRPClientError) throw e
    throw new PRPClientError(e.message, e)
  }
}

export const optionalData = async (response: Response) => {
  try {
    return await response.clone().json()
  } catch {
    return await response.clone().text()
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
