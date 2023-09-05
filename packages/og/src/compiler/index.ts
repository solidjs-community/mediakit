import type { PluginItem } from '@babel/core'
import {
  addDynamicImages,
  importIfNotThere,
  replaceDynamicImages,
} from './utils'
import type babel from '@babel/core'

export const transformOG = ({
  types: t,
}: {
  types: typeof babel.types
}): PluginItem => {
  return {
    visitor: {
      Program(path) {
        importIfNotThere(t, path, 'solid-start/server', 'server$', true)
        importIfNotThere(t, path, 'solid-js', 'createMemo')
        importIfNotThere(
          t,
          path,
          '@solid-mediakit/og/server',
          'createOpenGraphImage'
        )
        importIfNotThere(t, path, '@solid-mediakit/og/server', 'getArguments')
        const dynamicImages = replaceDynamicImages(t, path)
        addDynamicImages(dynamicImages, t, path)
        return path
      },
    },
  }
}
