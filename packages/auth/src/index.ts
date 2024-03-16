import { Auth, isAuthAction } from '@auth/core'
export { AuthError, CredentialsSignin } from '@auth/core/errors'

export type {
  Account,
  DefaultSession,
  Profile,
  Session,
  User,
} from '@auth/core/types'
import { SolidAuthConfig } from './types'
import { APIEvent, APIHandler } from '@solidjs/start/server'
export type { SolidAuthConfig }

const authorizationParamsPrefix = 'authorizationParams-'

export function SolidAuth(
  config: SolidAuthConfig | ((event: APIEvent) => PromiseLike<SolidAuthConfig>)
): {
  signIn: APIHandler
  signOut: APIHandler
  GET: APIHandler
  POST: APIHandler
} {
  const handler = async (event: APIEvent) => {
    const _config = typeof config === 'object' ? config : await config(event)
    setEnvDefaults(process.env, _config)
    const { request } = event
    const url = new URL(request.url)
    event.locals.auth ??= () => auth(event, _config)
    event.locals.getSession ??= event.locals.auth

    const action = url.pathname
      .slice(_config.basePath!.length + 1)
      .split('/')[0]
    if (
      isAuthAction(action) &&
      url.pathname.startsWith(_config.basePath + '/')
    ) {
      return Auth(request, _config)
    }

    return new Response('Not Found', { status: 404 })
  }
  return {
    signIn: async (event: APIEvent) => {
      const { request } = event
      const _config = typeof config === 'object' ? config : await config(event)
      setEnvDefaults(process.env, _config)
      const formData = await request.formData()
      const { providerId: provider, ...options } = Object.fromEntries(formData)
      // get the authorization params from the options prefixed with `authorizationParams-`
      let authorizationParams: Parameters<typeof signIn>[2] = {}
      let _options: Parameters<typeof signIn>[1] = {}
      for (const key in options) {
        if (key.startsWith(authorizationParamsPrefix)) {
          authorizationParams[key.slice(authorizationParamsPrefix.length)] =
            options[key] as string
        } else {
          _options[key] = options[key]
        }
      }
      await signIn(
        provider as string,
        _options,
        authorizationParams,
        _config,
        event
      )
    },
    signOut: async (event: APIEvent) => {
      const _config = typeof config === 'object' ? config : await config(event)
      setEnvDefaults(process.env, _config)
      const options = Object.fromEntries(await event.request.formData())
      await signOut(options, _config, event)
    },
    GET: handler,
    POST: handler,
  }
}

import { parse } from 'set-cookie-parser'

import { createActionURL, raw, skipCSRFCheck } from '@auth/core'
import { sendRedirect } from 'vinxi/http'
import { getBasePath, setEnvDefaults } from './utils'
import { Session } from '@auth/core/types'

type SignInParams = Parameters<App.Locals['signIn']>

export async function signIn(
  provider: SignInParams[0],
  options: SignInParams[1] = {},
  authorizationParams: SignInParams[2],
  config: SolidAuthConfig,
  event: APIEvent
) {
  const { request } = event
  const { protocol } = new URL(request.url)
  const headers = new Headers(request.headers)
  const {
    redirect: shouldRedirect = true,
    redirectTo,
    ...rest
  } = options instanceof FormData ? Object.fromEntries(options) : options

  const callbackUrl = redirectTo?.toString() ?? headers.get('Referer') ?? '/'
  const base = createActionURL(
    'signin',
    protocol,
    headers,
    process.env,
    config.basePath
  )

  if (!provider) {
    const url = `${base}?${new URLSearchParams({ callbackUrl })}`
    if (shouldRedirect) sendRedirect(event.nativeEvent, url, 302)
    return url
  }

  let url = `${base}/${provider}?${new URLSearchParams(authorizationParams)}`
  let foundProvider: SignInParams[0] | undefined = undefined

  for (const _provider of config.providers) {
    const { id } = typeof _provider === 'function' ? _provider() : _provider
    if (id === provider) {
      foundProvider = id
      break
    }
  }

  if (!foundProvider) {
    const url = `${base}?${new URLSearchParams({ callbackUrl })}`
    if (shouldRedirect) sendRedirect(event.nativeEvent, url, 302)
    return url
  }

  if (foundProvider === 'credentials') {
    url = url.replace('signin', 'callback')
  }

  headers.set('Content-Type', 'application/x-www-form-urlencoded')
  const body = new URLSearchParams({ ...rest, callbackUrl })
  const req = new Request(url, { method: 'POST', headers, body })
  const res = await Auth(req, { ...config, raw, skipCSRFCheck })

  for (const c of res?.cookies ?? []) {
    // event.cookies.set(c.name, c.value, { path: '/', ...c.options })
    event.response.headers.append(
      'set-cookie',
      `${c.name}=${c.value}; Path=/; ${
        c.options?.httpOnly ? 'HttpOnly;' : ''
      } ${c.options?.secure ? 'Secure;' : ''} ${
        c.options?.sameSite ? `SameSite=${c.options.sameSite};` : ''
      }`
    )
  }

  if (shouldRedirect) {
    return sendRedirect(event.nativeEvent, res.redirect!, 302)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.redirect as any
}

type SignOutParams = Parameters<App.Locals['signOut']>
export async function signOut(
  options: SignOutParams[0],
  config: SolidAuthConfig,
  event: APIEvent
) {
  const { request } = event
  const { protocol } = new URL(request.url)
  const headers = new Headers(request.headers)
  headers.set('Content-Type', 'application/x-www-form-urlencoded')

  const url = createActionURL(
    'signout',
    protocol,
    headers,
    process.env,
    config.basePath
  )
  const callbackUrl = options?.redirectTo ?? headers.get('Referer') ?? '/'
  const body = new URLSearchParams({ callbackUrl })
  const req = new Request(url, { method: 'POST', headers, body })

  const res = await Auth(req, { ...config, raw, skipCSRFCheck })

  // event.cookies.set(c.name, c.value, { path: '/', ...c.options })
  for (const c of res?.cookies ?? [])
    event.response.headers.append(
      'set-cookie',
      `${c.name}=${c.value}; Path=/; ${
        c.options?.httpOnly ? 'HttpOnly;' : ''
      } ${c.options?.secure ? 'Secure;' : ''} ${
        c.options?.sameSite ? `SameSite=${c.options.sameSite};` : ''
      }`
    )

  if (options?.redirect ?? true)
    return sendRedirect(event.nativeEvent, res.redirect!, 302)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res as any
}

export async function auth(
  event: APIEvent,
  config: SolidAuthConfig
): ReturnType<App.Locals['auth']> {
  setEnvDefaults(process.env, config)
  config.trustHost ??= true

  const { request: req } = event
  const { protocol } = new URL(req.url)
  const sessionUrl = createActionURL(
    'session',
    protocol,
    req.headers,
    process.env,
    config.basePath
  )
  const request = new Request(sessionUrl, {
    headers: { cookie: req.headers.get('cookie') ?? '' },
  })
  const response = await Auth(request, config)
  const authCookies = parse(response.headers.get('set-cookie') ?? '')
  for (const cookie of authCookies) {
    const { name, value, ...options } = cookie
    event.response.headers.append(
      'set-cookie',
      `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${
        options.secure ? 'Secure;' : ''
      } ${options.sameSite ? `SameSite=${options.sameSite};` : ''}`
    )
  }

  const { status = 200 } = response
  const data = await response.json()

  if (!data || !Object.keys(data).length) return null
  if (status === 200) return data
  throw new Error(data.message)
}

export type GetSessionResult = Promise<Session | null>

export async function getSession(
  req: Request,
  options: SolidAuthConfig
): GetSessionResult {
  options.secret ??= process.env.AUTH_SECRET
  options.trustHost ??= true

  const basePath = getBasePath()
  const url = new URL(`${basePath}/session`, req.url)
  const response = await Auth(
    new Request(url, { headers: req.headers }),
    options
  )

  const { status = 200 } = response

  const data = await response.json()

  if (!data || !Object.keys(data).length) return null
  if (status === 200) return data
  throw new Error(data.message)
}
