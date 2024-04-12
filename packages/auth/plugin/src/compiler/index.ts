/* eslint-disable @typescript-eslint/no-explicit-any */
import type babel from '@babel/core'
import { type FilterPattern } from '@rollup/pluginutils'
export { compileAuth } from './babel'

export interface AuthPluginOptions {
  babel?: babel.TransformOptions
  filter?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
  log?: boolean
  redirectTo: string
  authOpts: {
    name: string
    dir: string
  }
  // @default media-user
  userKey?: string
}

export * from './babel'
