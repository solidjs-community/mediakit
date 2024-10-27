/* eslint-disable @typescript-eslint/no-explicit-any */
import * as babel from '@babel/core'
import { ImportPluginOptions } from '.'

const specificImports = ['createSignal', 'createEffect']

export function createTransform$(opts?: ImportPluginOptions) {
  return function transform$({
    types: t,
    template: temp,
  }: {
    types: typeof babel.types
    template: typeof babel.template
  }): babel.PluginObj {
    return {
      visitor: {
        ImportDeclaration(path) {
          if (path.node.source.value === 'solid-js') {
            const specificSpecifiers = path.node.specifiers.filter(
              (specifier) =>
                t.isImportSpecifier(specifier) &&
                specificImports.includes((specifier.imported as any).name),
            )
            const otherSpecifiers = path.node.specifiers.filter(
              (specifier) =>
                t.isImportSpecifier(specifier) &&
                !specificImports.includes((specifier.imported as any).name),
            )
            if (specificSpecifiers.length > 0) {
              const newImportDeclaration = t.importDeclaration(
                specificSpecifiers,
                t.stringLiteral('solid-js/dist/solid'),
              )
              path.insertAfter(newImportDeclaration)
              if (otherSpecifiers.length > 0) {
                path.node.specifiers = otherSpecifiers
              } else {
                path.remove()
              }
            }
          }
        },
      },
    }
  }
}

export async function compilepImports(
  code: string,
  id: string,
  opts?: ImportPluginOptions,
) {
  try {
    const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
    const transform$ = createTransform$(opts)
    const transformed = await babel.transformAsync(code, {
      presets: [['@babel/preset-typescript'], ...(opts?.babel?.presets ?? [])],
      parserOpts: {
        plugins,
      },
      plugins: [[transform$], ...(opts?.babel?.plugins ?? [])],
      filename: id,
    })
    if (transformed) {
      if (opts?.log) {
        console.log(id, transformed.code)
      }
      return {
        code: transformed.code ?? '',
        map: transformed.map,
      }
    }
    return null
  } catch (e) {
    console.error('err$$', e)
    return null
  }
}
