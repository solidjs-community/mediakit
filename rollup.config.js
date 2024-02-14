import babel from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/client.tsx',
  output: [
    {
      file: 'dist/client.js',
      format: 'es',
    },
  ],
  external: [
    'solid-js',
    '@solidjs/start',
    'solid-js/web',
    'solid-js/web/storage',
  ],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.tsx'],
    }),
    babel({
      extensions: ['.js', '.ts', '.tsx'],
      babelHelpers: 'bundled',
      presets: ['solid', '@babel/preset-typescript'],
      exclude: 'node_modules/**',
    }),
  ],
}
