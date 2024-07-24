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
          babelUtils.importIfNotThere(path, t, 'createMemo', 'solid-js')
          babelUtils.importIfNotThere(
            path,
            t,
            'createOpenGraphImage',
            '@solid-mediakit/og/server'
          )
          addDynamicImages(dynamicImages, t, path)
        }
        return path
      },
    },
  }
}
