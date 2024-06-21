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
        const dynamicImages = replaceDynamicImages(t, path)
        if (dynamicImages.length) {
          babelUtils.importIfNotThere(t, path, 'solid-js', 'createMemo')
          babelUtils.importIfNotThere(
            t,
            path,
            '@solid-mediakit/og/server',
            'createOpenGraphImage'
          )
        }
        addDynamicImages(dynamicImages, t, path)
        return path
      },
    },
  }
}
