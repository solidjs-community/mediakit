import { Plugin } from 'vite'

// From: https://github.com/bluwy/whyframe/blob/master/packages/jsx/src/index.js#L27-L37
export function repushPlugin(
  plugins: Plugin[],
  plugin: Plugin | string,
  pluginNames: string[]
): void {
  const namesSet = new Set(pluginNames)
  const name = typeof plugin === 'string' ? plugin : plugin.name
  const currentPlugin = plugins.find((e) => e.name === name)!
  let baseIndex = -1
  let targetIndex = -1
  for (let i = 0, len = plugins.length; i < len; i += 1) {
    const current = plugins[i]
    if (namesSet.has(current.name) && baseIndex === -1) {
      baseIndex = i
    }
    if (current.name === name) {
      targetIndex = i
    }
  }
  if (baseIndex !== -1 && targetIndex !== -1 && baseIndex < targetIndex) {
    plugins.splice(targetIndex, 1)
    plugins.splice(baseIndex, 0, currentPlugin)
  }
}
