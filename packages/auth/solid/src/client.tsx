import type {
  BuiltInProviderType,
  RedirectableProviderType,
} from '@auth/core/providers'
import { Session } from '@auth/core/types'
import {
  Accessor,
  JSX,
  Resource,
  createContext,
  createResource,
  onCleanup,
  useContext,
} from 'solid-js'
import { conditionalEnv, getBasePath, getEnv, parseUrl } from './utils'
import { getRequestEvent, isServer } from 'solid-js/web'
import {
  AuthClientConfig,
  LiteralUnion,
  SignInAuthorizationParams,
  SignInOptions,
  SignOutParams,
} from './types'

export const __SOLIDAUTH: Omit<AuthClientConfig, '_lastSync' | '_session'> = {
  baseUrl: parseUrl(conditionalEnv('AUTH_URL', 'VERCEL_URL')).origin,
  basePath: parseUrl(getEnv('AUTH_URL')).path,
  baseUrlServer: parseUrl(
    conditionalEnv('AUTH_URL_INTERNAL', 'AUTH_URL', 'VERCEL_URL'),
  ).origin,
  basePathServer: parseUrl(conditionalEnv('AUTH_URL_INTERNAL', 'AUTH_URL'))
    .path,
  _getSession: () => {},
}

export async function signIn<
  P extends RedirectableProviderType | undefined = undefined,
>(
  providerId?: LiteralUnion<
    P extends RedirectableProviderType
      ? P | BuiltInProviderType
      : BuiltInProviderType
  >,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams,
) {
  const { callbackUrl = window.location.href, redirect = true } = options ?? {}

  // TODO: Support custom providers
  const isCredentials = providerId === 'credentials'
  const isEmail = providerId === 'email'
  const isSupportingReturn = isCredentials || isEmail

  const basePath = getBasePath()
  const signInUrl = `${basePath}/${
    isCredentials ? 'callback' : 'signin'
  }/${providerId}`

  const _signInUrl = `${signInUrl}?${new URLSearchParams(authorizationParams)}`

  // TODO: Remove this since Sveltekit offers the CSRF protection via origin check
  const csrfTokenResponse = await fetch(`${basePath}/csrf`)
  const { csrfToken } = await csrfTokenResponse.json()

  const res = await fetch(_signInUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Auth-Return-Redirect': '1',
    },
    // @ts-ignore
    body: new URLSearchParams({
      ...options,
      csrfToken,
      callbackUrl,
    }),
  })

  const data = await res.clone().json()

  if (redirect || !isSupportingReturn) {
    // TODO: Do not redirect for Credentials and Email providers by default in next major
    window.location.href = data.url ?? callbackUrl
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (data.url.includes('#')) window.location.reload()
    return
  }

  const error = new URL(data.url).searchParams.get('error')
  const code = new URL(data.url).searchParams.get('code')

  if (res.ok) {
    console.log('here$$')
    await __SOLIDAUTH._getSession()
  }

  return {
    error,
    code,
    status: res.status,
    ok: res.ok,
    url: error ? null : data.url,
  } as any
}

/**
 * Signs the user out, by removing the session cookie.
 * Automatically adds the CSRF token to the request.
 *
 * [Documentation](https://authjs.dev/reference/sveltekit/client#signout)
 */
export async function signOut<R extends boolean = true>(
  options?: SignOutParams<R>,
) {
  const { redirectTo = window.location.href } = options ?? {}
  const basePath = getBasePath()
  const csrfTokenResponse = await fetch(`${basePath}/csrf`)
  const { csrfToken } = await csrfTokenResponse.json()
  const res = await fetch(`${basePath}/signout`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Auth-Return-Redirect': '1',
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: redirectTo,
    }),
  })
  const data = await res.json()

  if (options?.redirect ?? true) {
    const url = data.url ?? redirectTo
    window.location.href = url
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes('#')) window.location.reload()
    return
  }

  await __SOLIDAUTH._getSession()

  return data
}

export const SessionContext = createContext<Resource<SessionState>>(undefined)

export function createSession(): Accessor<SessionState> {
  // @ts-expect-error Satisfy TS if branch on line below
  const value: SessionContextValue<R> = useContext(SessionContext)
  if (!value && (import.meta as any).env.DEV) {
    throw new Error(
      '[@solid-mediakit/auth]: `createSession` must be wrapped in a <SessionProvider />',
    )
  }

  return value
}
export interface SessionProviderProps {
  children: JSX.Element
  baseUrl?: string
  basePath?: string
  deferStream?: boolean
}

type SessionState =
  | {
      status: 'authenticated'
      data: Session
    }
  | {
      status: 'unauthenticated'
      data: null
    }
  | {
      status: 'loading'
      data: undefined
    }

export function SessionProvider(props: SessionProviderProps) {
  const event = getRequestEvent()

  const authAction = async (): Promise<SessionState> => {
    try {
      const _session = await getSession(event)
      if (_session) {
        return {
          status: 'authenticated',
          data: _session,
        }
      }
      return {
        status: 'unauthenticated',
        data: null,
      }
    } catch {
      return {
        status: 'unauthenticated',
        data: null,
      }
    }
  }

  const [authResource, { refetch }] = createResource(
    async () => {
      if (event?.locals.session) {
        return {
          status: 'authenticated' as const,
          data: event.locals.session,
        }
      }
      return await authAction()
    },
    {
      initialValue: event?.locals.session
        ? {
            status: 'authenticated',
            data: event.locals.session,
          }
        : {
            status: 'loading',
            data: undefined,
          },
      deferStream: props.deferStream ?? true,
    },
  )
  __SOLIDAUTH._getSession = () => refetch()

  onCleanup(() => {
    __SOLIDAUTH._getSession = () => {}
  })

  return (
    <SessionContext.Provider value={authResource}>
      {props.children}
    </SessionContext.Provider>
  )
}

const getUrl = (endpoint: string) => {
  if (typeof window === 'undefined') {
    return `${__SOLIDAUTH.baseUrlServer}${endpoint}`
  }
  return endpoint
}

export const getSession = async (
  event?: ReturnType<typeof getRequestEvent>,
) => {
  let reqInit: RequestInit | undefined
  if (isServer && event?.request) {
    const cookie = event.request.headers.get('cookie')
    if (cookie) {
      reqInit = {
        headers: {
          cookie,
        },
      }
    }
  }
  const res = await fetch(getUrl(`${getBasePath()}/session`), reqInit)
  if (isServer && event?.request && (event as any)?.response) {
    const cookie = res.headers.get('set-cookie')
    if (cookie) {
      try {
        ;(event as any).response.headers.append('set-cookie', cookie ?? '')
      } catch (e) {
        // console.log('spcasfafError: ', e)
      }
    }
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  if (!data) return null
  if (Object.keys(data).length === 0) return null
  return data
}
