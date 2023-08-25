import typescript from '@rollup/plugin-typescript'

export default {
  // input: ['./src/index.ts', './src/server/index.ts'],
  input: {
    index: './src/index.ts',
    server: './src/server/index.ts',
  },
  output: [
    {
      dir: 'dist',
      format: 'es',
    },
    // {
    //   file: 'dist/index.js',
    //   format: 'es',
    // },
  ],
  plugins: [typescript()],
}
