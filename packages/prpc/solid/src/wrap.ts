import { getRequestEvent, isServer } from 'solid-js/web'
import { PRPClientError } from './error'
import { ExpectedFn$ } from './types'
import { startTransition } from 'solid-js'

export async function wrapFn<Fn extends ExpectedFn$<any, any>>(
  callFn: Fn,
  input: any,
  method: 'GET' | 'POST',
  navigate?: (url: string, opts?: { replace?: boolean }) => void,
) {
  const handleResponse = genHandleResponse()

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
      const url = response.headers.get('Location')
      const isRedirect = isRedirectResponse(response) ? url : null
      if (isServer) {
        handleResponse?.(response, isRedirect)
      }
      if (response.headers.get('X-pRPC-Error') === '1') {
        const isValidationError =
          response.headers.get('X-pRPC-Validation') === '1'
        const error = await optionalData(response)
        throw new PRPClientError(
          error.error.message,
          isValidationError ? error.error.issues : error.error,
          isValidationError,
        )
      } else if (isRedirect) {
        if (navigate && isRedirect.startsWith('/'))
          startTransition(() => {
            navigate(isRedirect, { replace: true })
          })
        else if (!isServer) window.location.href = isRedirect
        return {
          ['prpc-redirect']: isRedirect,
        }
      } else {
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
    (redirectStatusCodes.has(response.status) ||
      response.headers.get('X-pRPC-Redirect') === '1')
  )
}

export const genHandleResponse = () => {
  const event = getRequestEvent()
  return (response: Response, isRedirect: string | null) => {
    if (isServer && event) {
      try {
        if ((event as any).response) {
          response.headers.forEach((value, key) => {
            if (key === 'content-type') return
            ;(event as any).response.headers.set(key, value)
          })
        }
        if (isRedirect) {
          event.response.headers.set('Location', isRedirect)
          event.response.status = 302
        }
      } catch {
        // already sent to the client
      }
    }
  }
}

export function handleRedirect(response: Response, useRouter?: boolean) {
  const url = response.headers.get('Location')
  if (url) {
    if (typeof window !== 'undefined' && !useRouter) {
      window.location.href = url
    } else {
      return {
        redirect: url,
      }
    }
  }
}
