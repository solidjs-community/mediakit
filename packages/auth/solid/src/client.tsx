import type {
  BuiltInProviderType,
  RedirectableProviderType,
} from '@auth/core/providers'
import { Session } from '@auth/core/types'
import {
  JSX,
  Resource,
  createContext,
  createEffect,
  createResource,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { conditionalEnv, getBasePath, getEnv, now, parseUrl } from './utils'
import { getRequestEvent, isServer } from 'solid-js/web'
import {
  AuthClientConfig,
  LiteralUnion,
  SignInAuthorizationParams,
  SignInOptions,
  SignOutParams,
} from './types'

export async function signIn<
  P extends RedirectableProviderType | undefined = undefined
>(
  providerId?: LiteralUnion<
    P extends RedirectableProviderType
      ? P | BuiltInProviderType
      : BuiltInProviderType
  >,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams
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

  return res
}

/**
 * Signs the user out, by removing the session cookie.
 * Automatically adds the CSRF token to the request.
 *
 * [Documentation](https://authjs.dev/reference/sveltekit/client#signout)
 */
export async function signOut(options?: SignOutParams) {
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

  const url = data.url ?? redirectTo
  window.location.href = url
  // If url contains a hash, the browser does not reload the page. We reload manually
  if (url.includes('#')) window.location.reload()
}

export const __SOLIDAUTH: AuthClientConfig = {
  baseUrl: parseUrl(conditionalEnv('AUTH_URL', 'VERCEL_URL')).origin,
  basePath: parseUrl(getEnv('AUTH_URL')).path,
  baseUrlServer: parseUrl(
    conditionalEnv('AUTH_URL_INTERNAL', 'AUTH_URL', 'VERCEL_URL')
  ).origin,
  basePathServer: parseUrl(conditionalEnv('AUTH_URL_INTERNAL', 'AUTH_URL'))
    .path,
  _lastSync: 0,
  _session: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _getSession: () => {},
}

export const SessionContext = createContext<
  Resource<Session | null> | undefined
>(undefined)

export function createSession(): Resource<Session | null> {
  // @ts-expect-error Satisfy TS if branch on line below
  const value: SessionContextValue<R> = useContext(SessionContext)
  if (!value && (import.meta as any).env.DEV) {
    throw new Error(
      '[@solid-mediakit/auth]: `createSession` must be wrapped in a <SessionProvider />'
    )
  }

  return value
}
export interface SessionProviderProps {
  children: JSX.Element
  baseUrl?: string
  basePath?: string
  refetchOnWindowFocus?: boolean
}

export function SessionProvider(props: SessionProviderProps) {
  const event = getRequestEvent()
  __SOLIDAUTH._session = (event as any)?.locals?.session
  const [session, { refetch }] = createResource(
    async (_, opts: any) => {
      const thisEvent = opts?.refetching?.event
      const storageEvent = thisEvent === 'storage'
      const initEvent = thisEvent === 'init' || thisEvent === undefined
      if (initEvent || storageEvent || __SOLIDAUTH._session === undefined) {
        __SOLIDAUTH._lastSync = now()
        __SOLIDAUTH._session = await getSession(event)
        return __SOLIDAUTH._session
      } else if (
        !thisEvent ||
        __SOLIDAUTH._session === null ||
        now() < __SOLIDAUTH._lastSync
      ) {
        return __SOLIDAUTH._session
      } else {
        __SOLIDAUTH._lastSync = now()
        __SOLIDAUTH._session = await getSession(event)
        return __SOLIDAUTH._session
      }
    },
    {
      initialValue: __SOLIDAUTH._session,
    }
  )

  onMount(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __SOLIDAUTH._getSession = ({ event }) => refetch({ event })

    onCleanup(() => {
      __SOLIDAUTH._lastSync = 0
      __SOLIDAUTH._session = undefined
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      __SOLIDAUTH._getSession = () => {}
    })
  })

  createEffect(() => {
    const { refetchOnWindowFocus = true } = props
    const visibilityHandler = () => {
      if (refetchOnWindowFocus && document.visibilityState === 'visible')
        __SOLIDAUTH._getSession({ event: 'visibilitychange' })
    }
    document.addEventListener('visibilitychange', visibilityHandler, false)
    onCleanup(() =>
      document.removeEventListener('visibilitychange', visibilityHandler, false)
    )
  })

  return (
    <SessionContext.Provider value={session as any}>
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
  event?: ReturnType<typeof getRequestEvent>
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
