import typescript from '@rollup/plugin-typescript'
import jsx from 'acorn-jsx'
export default {
  input: {
    index: './src/index.tsx',
    server: './src/server/index.ts',
    unplugin: './src/unplugin/index.ts',
  },
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: (chunkInfo) => {
      const name = chunkInfo.name
      return `[name].${name === 'index' ? 'jsx' : 'js'}`
    },
  },

  acornInjectPlugins: [jsx()],
  plugins: [typescript({ jsx: 'preserve' })],
}