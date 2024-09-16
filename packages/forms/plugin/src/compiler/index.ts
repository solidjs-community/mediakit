/* eslint-disable @typescript-eslint/no-explicit-any */
import type babel from '@babel/core'
import { type FilterPattern } from '@rollup/pluginutils'
export { compileForm } from './babel'

export interface FormluginOptions {
  babel?: babel.TransformOptions
  filter?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
  log?: boolean
}

export * from './babel'
