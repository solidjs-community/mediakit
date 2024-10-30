/* eslint-disable @typescript-eslint/no-explicit-any */
import type babel from '@babel/core'
import { type FilterPattern } from '@rollup/pluginutils'
export { compilepAuthPC } from './babel'

export type AllowedAuth = 'clerk' | 'authjs'

type AuthJSConfig = {
  authCfg: {
    source: string
    configName: string
    protectedMessage?: string
  }
}

type ClerkConfig = {
  authCfg: {
    middleware: string
    protectedMessage?: string
  }
}

export type AuthPCPluginOptions<K extends AllowedAuth | undefined> = {
  babel?: babel.TransformOptions
  filter?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
  log?: boolean
  auth?: K
  advanced?: boolean
} & (undefined extends K
  ? {}
  : K extends 'authjs'
    ? AuthJSConfig
    : K extends 'clerk'
      ? ClerkConfig
      : {})

export * from './babel'
