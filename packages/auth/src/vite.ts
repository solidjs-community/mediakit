/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFilter } from '@rollup/pluginutils'
import type { Plugin } from 'vite'
import * as babel from '@babel/core'

type Options = {
  protected: string[] | string
  //   @default ~/server/auth
  authLocation?: string
}

const DEFAULT_INCLUDE = 'src/**/*.{jsx,tsx,ts,js,mjs,cjs}'
const DEFAULT_EXCLUDE = 'node_modules/**/*.{jsx,tsx,ts,js,mjs,cjs}'

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

const log = true
async function compileAuth(code: string, id: string, opts?: Options) {
  console.log(`compiling auth ${id}`)
  const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
  const transformAuth = createTransformAuth(opts)
  const transformed = await babel.transformAsync(code, {
    presets: [['@babel/preset-typescript']],
    parserOpts: {
      plugins,
    },
    plugins: [[transformAuth]],
    filename: id,
  })
  if (transformed) {
    log && console.log(transformed.code)
    return {
      code: transformed.code ?? '',
      map: transformed.map,
    }
  }
  return null
}

function createTransformAuth(opts?: Options) {
  return function transformAuth({
    types: t,
    template: temp,
  }: {
    types: typeof babel.types
    template: typeof babel.template
  }): babel.PluginItem {
    return {
      visitor: {
        Program: (path) => {
          importIfNotThere(t, path, 'solid-start/server', 'createServerData$')
          importIfNotThere(
            t,
            path,
            opts?.authLocation ?? '~/server/auth',
            'authOptions'
          )
          importIfNotThere(t, path, '@solid-mediakit/auth', 'getSession')
          pushCode(
            temp,
            path,
            `export function routeData() {
  return createServerData$(async (_$_key, { request: $_request }) => {
    const session = await getSession($_request, authOptions)
    console.log('session', session)
    return {
      session,
    }
  })
}`,
            true
          )
        },
        ExportDefaultDeclaration: () => {
          console.log('export default declaration')
          //   const declaration = path.node.declaration
        },
      },
    }
  }
}

const importIfNotThere = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>,
  from: string,
  shouldImport: string
) => {
  const serverImport = path.node.body.find(
    (node) =>
      node.type === 'ImportDeclaration' &&
      node.source.value === from &&
      node.specifiers.find(
        (specifier) =>
          specifier.type === 'ImportSpecifier' &&
          (specifier.imported as any).name === shouldImport
      )
  )
  if (!serverImport) {
    console.log(`importing ${shouldImport} from ${from}`)
    path.node.body.unshift(
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier(shouldImport),
            t.identifier(shouldImport)
          ),
        ],
        t.stringLiteral(from)
      )
    )
  }
}

const pushCode = (
  temp: typeof babel.template,
  path: babel.NodePath<babel.types.Program>,
  code: string,
  pushToTop = false
) => {
  const c = temp(code)()
  const cAsArray = Array.isArray(c) ? c : [c]
  if (pushToTop) {
    const lastImport = path.node.body.findIndex(
        (node) => node.type !== 'ImportDeclaration'
      ),
      before = path.node.body.slice(0, lastImport),
      after = path.node.body.slice(lastImport)
    path.node.body = [...before, ...cAsArray, ...after]
  } else {
    path.node.body.push(...cAsArray)
  }
}
