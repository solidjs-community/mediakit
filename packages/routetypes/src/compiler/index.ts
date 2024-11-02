/* eslint-disable @typescript-eslint/no-explicit-any */
import type babel from '@babel/core'
import { type FilterPattern } from '@rollup/pluginutils'
export { compile } from './babel'

export type PluginOptions = {
  babel?: babel.TransformOptions
  filter?: {
    include?: FilterPattern
    exclude?: FilterPattern
  }
}
export * from './babel'
