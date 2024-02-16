import withSolid from 'rollup-preset-solid'

export default withSolid([
  { input: './src/index.tsx', targets: ['esm'] },
  {
    input: './src/handler.ts',
    targets: ['esm'],
  },
])
