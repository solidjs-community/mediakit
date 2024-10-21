import type {
  BuiltInProviderType,
  RedirectableProviderType,
} from '@auth/core/providers'
import { Session } from '@auth/core/types'
import {
  Accessor,
  JSX,
  Setter,
  createContext,
  createSignal,
  onMount,
  useContext,
} from 'solid-js'
import { conditionalEnv, getBasePath, parseUrl } from './utils'
import { RequestEvent, getRequestEvent, isServer } from 'solid-js/web'
import {
  LiteralUnion,
  SignInAuthorizationParams,
  SignInOptions,
  SignOutParams,
} from './types'

export const SessionContext = createContext<{
  sessionState: Accessor<SessionState>
  setSessionState: Setter<SessionState>
  authAction: () => Promise<void>
}>(undefined)

export interface SessionProviderProps {
  children: JSX.Element
  baseUrl?: string
  basePath?: string
  deferStream?: boolean
  refetchAfterServer?: boolean
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

export const useAuth = (): AuthRes => {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error(
      '[@solid-mediakit/auth]: `useAuth` must be wrapped in a <SessionProvider />',
    )
  }
  const authSignIn = async <
    P extends RedirectableProviderType | undefined = undefined,
  >(
    providerId?: LiteralUnion<
      P extends RedirectableProviderType
        ? P | BuiltInProviderType
        : BuiltInProviderType
    >,
    options?: SignInOptions,
    authorizationParams?: SignInAuthorizationParams,
  ) => {
    return await signIn(
      value.authAction,
      providerId,
      options,
      authorizationParams,
    )
  }

  const authSignOut = async <R extends boolean = true>(
    options?: SignOutParams<R>,
  ) => {
    return await signOut(value.authAction, options)
  }

  return {
    signIn: authSignIn,
    signOut: authSignOut,
    status: () =>
      value.sessionState().status as
        | 'authenticated'
        | 'unauthenticated'
        | 'loading',
    session: () => value.sessionState().data as Session | null | undefined,
  }
}

type AuthEvent = RequestEvent & {
  locals?: { session?: null | Session }
  nativeEvent?: { context?: { session?: null | Session } }
}
const getSessionFromEvent = (event: AuthEvent) => {
  if (event.locals?.session) return event.locals.session
  return event.nativeEvent?.context?.session
}

export function SessionProvider(props: SessionProviderProps) {
  const event = getRequestEvent()
  const initialSession = isServer
    ? getSessionFromEvent(event! as unknown as AuthEvent)
    : undefined

  const [sessionState, setSessionState] = createSignal<SessionState>(
    initialSession === null
      ? {
          status: 'unauthenticated',
          data: null,
        }
      : initialSession
        ? {
            status: 'authenticated',
            data: initialSession,
          }
        : {
            status: 'loading',
            data: undefined,
          },
  )

  const _innerAction = async (): Promise<SessionState> => {
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
    } catch (e) {
      console.error('@auth', e)
      return {
        status: 'unauthenticated',
        data: null,
      }
    }
  }

  const authAction = async (initial?: boolean) => {
    if (
      initial &&
      sessionState().status !== 'loading' &&
      !props.refetchAfterServer
    ) {
      return
    }
    setSessionState(await _innerAction())
  }

  onMount(() => {
    void authAction(true)
  })

  return (
    <SessionContext.Provider
      value={{
        sessionState,
        setSessionState,
        authAction,
      }}
    >
      {props.children}
    </SessionContext.Provider>
  )
}

const getUrl = (endpoint: string) => {
  if (typeof window === 'undefined') {
    return `${
      parseUrl(conditionalEnv('AUTH_URL_INTERNAL', 'AUTH_URL', 'VERCEL_URL'))
        .origin
    }${endpoint}`
  }
  return endpoint
}

type AuthRes = {
  signIn: <P extends RedirectableProviderType | undefined = undefined>(
    providerId?: LiteralUnion<
      P extends RedirectableProviderType
        ? P | BuiltInProviderType
        : BuiltInProviderType
    >,
    options?: SignInOptions,
    authorizationParams?: SignInAuthorizationParams,
  ) => ReturnType<typeof signIn>
  signOut: <R extends boolean = true>(
    options?: SignOutParams<R>,
  ) => ReturnType<typeof signOut>
  status: Accessor<'authenticated' | 'unauthenticated' | 'loading'>
  session: Accessor<Session | null | undefined>
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

async function signIn<
  P extends RedirectableProviderType | undefined = undefined,
>(
  refetchAuth: () => Promise<void>,
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
    await refetchAuth()
  }

  return {
    error,
    code,
    status: res.status,
    ok: res.ok,
    url: error ? null : data.url,
  } as any
}

async function signOut<R extends boolean = true>(
  refetchAuth: () => Promise<void>,
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

  await refetchAuth()

  return data
}
