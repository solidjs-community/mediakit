import type { PluginObj } from '@babel/core'
import { addDynamicImages, replaceDynamicImages } from './utils'
import type babel from '@babel/core'
import { babel as babelUtils } from '@solid-mediakit/shared'

export const transformOG = ({
  types: t,
}: {
  types: typeof babel.types
}): PluginObj => {
  return {
    visitor: {
      Program(path) {
        babelUtils.importIfNotThere(
          t,
          path,
          'solid-start/server',
          'server$',
          true
        )
        babelUtils.importIfNotThere(t, path, 'solid-js', 'createMemo')
        babelUtils.importIfNotThere(
          t,
          path,
          '@solid-mediakit/og/server',
          'createOpenGraphImage'
        )
        babelUtils.importIfNotThere(
          t,
          path,
          '@solid-mediakit/og/server',
          'getArguments'
        )
        const dynamicImages = replaceDynamicImages(t, path)
        addDynamicImages(dynamicImages, t, path)
        return path
      },
    },
  }
}
