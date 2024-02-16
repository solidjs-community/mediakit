import withSolid from 'rollup-preset-solid'

export default withSolid([
  { input: './src/client.tsx', targets: ['esm'] },
  { input: './src/index.ts', targets: ['esm'] },
])
