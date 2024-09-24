/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Session } from '@auth/core/types'
import { SolidAuthConfig } from './types'
import { setEnvDefaults as coreSetEnvDefaults } from '@auth/core'
import { isDev } from 'solid-js/web'

export interface InternalUrl {
  origin: string
  host: string
  path: string
  base: string
  toString: () => string
}

export function parseUrl(url?: string | URL): InternalUrl {
  const defaultUrl = new URL('http://localhost:3000/api/auth')

  if (url && !url.toString().startsWith('http')) {
    url = `https://${url}`
  }

  const _url = new URL(url ?? defaultUrl)
  const path = (
    _url.pathname === '/' ? defaultUrl.pathname : _url.pathname
  ).replace(/\/$/, '')

  const base = `${_url.origin}${path}`

  return {
    origin: _url.origin,
    host: _url.host,
    path,
    base,
    toString: () => base,
  }
}

export function now() {
  return Math.floor(Date.now() / 1000)
}

export function objectIsSession(obj: any): obj is Session {
  return obj && Object.keys(obj).length > 0
}

export const getEnv = (env: string) => {
  if (env.startsWith('VITE_')) {
    return (import.meta as any).env[env]
  }
  if (
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    !env.startsWith('VITE_')
  ) {
    return process.env[env]
  }
  return undefined
}

export const conditionalEnv = (...envs: string[]) => {
  for (const env of envs) {
    const value = getEnv(env)
    if (value) {
      return value
    }
  }
  return undefined
}

export function setEnvDefaults(
  envObject: Record<string, string | undefined>,
  config: SolidAuthConfig,
) {
  coreSetEnvDefaults(envObject, config, true)
  config.trustHost ??= isDev
  config.basePath ??= getBasePath(config)
}

export const getBasePath = (config?: SolidAuthConfig): string => {
  if (config?.basePath) return config.basePath
  const ev = conditionalEnv('VITE_AUTH_PATH')
  return ev ?? `/api/auth`
}
