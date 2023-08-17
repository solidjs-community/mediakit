/* eslint-disable @typescript-eslint/no-extra-semi */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFilter } from '@rollup/pluginutils'
import type { Plugin } from 'vite'
import * as babel from '@babel/core'
import {
  DEFAULT_EXCLUDE,
  DEFAULT_INCLUDE,
  createTransformAuth,
  type Options,
} from './compiler/plugin.js'

export default function auth(opts?: Options): Plugin {
  const protectedRoutes =
    (typeof opts?.protected === 'string'
      ? [opts.protected]
      : opts?.protected) ?? []
  const filter = createFilter(DEFAULT_INCLUDE, DEFAULT_EXCLUDE)
  return {
    enforce: 'pre',
    name: 'vite-plugin-auth',
    async transform(code, id) {
      if (!filter(id)) {
        return code
      }
      if (isProtected(protectedRoutes, id)) {
        return await compileAuth(code, id, opts)
      }
      return undefined
    },
  }
}

const isProtected = (protectedRoutes: string[], id: string) => {
  return protectedRoutes.some((route) => id.includes(`routes/${route}`))
}

async function compileAuth(code: string, id: string, opts?: Options) {
  const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
  const transformAuth = createTransformAuth(opts)
  const transformed = await babel.transformAsync(code, {
    presets: [['@babel/preset-typescript']],
    parserOpts: {
      plugins,
    },
    plugins: [[transformAuth]],
    filename: id,
    sourceMaps: true,
    sourceFileName: id,
  })
  if (transformed) {
    opts?.log && console.log(transformed.code)
    return {
      code: transformed.code ?? '',
      map: transformed.map,
    }
  }
  return null
}
