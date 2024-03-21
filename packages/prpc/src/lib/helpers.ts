import { getRequestEvent, isServer } from 'solid-js/web'
import { ExpectedFn } from '../types'
import { PRPCClientError } from './error'

export const makeKey = (
  type: 'query' | 'mutation',
  key: string,
  input?: any
) => {
  if (type === 'mutation') {
    return ['prpc.mutation', key]
  }
  return ['prpc.query', key, input]
}

export const unwrapValue = (value: any) => {
  if (typeof value === 'function') {
    return { payload: value() }
  }
  return { payload: value }
}
export function figureOutMessageError(err: any) {
  if (typeof err === 'string') {
    return err
  }
  if (err && typeof err === 'object') {
    if ('formErrors' in err) {
      return 'Invalid Data Was Provided'
    } else if (err instanceof Error || 'message' in err) {
      return err.message
    }
  }
  return 'Unknown Error'
}

export async function tryAndWrap<Fn extends ExpectedFn<any>>(
  queryFn: Fn,
  input: any,
  handleResponse?: (response: Response) => any
) {
  const value = unwrapValue(input)
  let response: any
  try {
    response = await queryFn({
      payload: JSON.stringify(value.payload),
    } as any)
  } catch (e: any) {
    throw new PRPCClientError(figureOutMessageError(e), e)
  }
  if (response instanceof Response) {
    handleResponse?.(response)
    const url = response.headers.get('location')
    if (response.headers.get('X-Prpc-Error') === '1') {
      const error = await optionalData(response)
      throw new PRPCClientError(figureOutMessageError(error.error), error.error)
    } else if (!isRedirectResponse(response) || !url) {
      return await optionalData(response)
    }
  }
  return response
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
