/* eslint-disable @typescript-eslint/no-explicit-any */
import type babel from '@babel/core'
import { type FilterPattern } from '@rollup/pluginutils'
export { compilepImports } from './babel'

export type ImportPluginOptions = {
  babel?: babel.TransformOptions
  filter?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
  log?: boolean
}

export * from './babel'
