import typescript from '@rollup/plugin-typescript'
import jsx from 'acorn-jsx'
export default {
  input: {
    index: './src/index.tsx',
    server: './src/server/index.ts',
  },
  output: [
    {
      dir: 'dist',
      format: 'es',
    },
  ],
  acornInjectPlugins: [jsx()],
  plugins: [typescript({ jsx: 'preserve' })],
}
