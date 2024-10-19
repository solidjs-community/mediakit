export * from './createCaller'
export * from './createAction'
export * from './utils'
export * from './provider'
import type { createApp } from 'vinxi/dist/types/lib/app'

export interface BaseSettings {
  config: ReturnType<typeof createApp> & { auth?: 'authjs' | 'clerk' }
}

export interface Settings extends BaseSettings {}
