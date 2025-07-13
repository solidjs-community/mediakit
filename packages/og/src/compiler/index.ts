import type { PluginObj } from '@babel/core'
import { addDynamicImages, addDynamicImagesTanstack, replaceDynamicImages } from './utils'
import type babel from '@babel/core'
import { babel as babelUtils } from '@solid-mediakit/shared'
type Runtime = "SolidStart" | "TanstackStart"
export const transformOG = (runtime?: Runtime) => ({
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
					if (runtime == "TanstackStart") {
						addDynamicImagesTanstack(dynamicImages, t, path)
					}
					else {
						addDynamicImages(dynamicImages, t, path)
					}
        }
        return path
      },
    },
  }
}
