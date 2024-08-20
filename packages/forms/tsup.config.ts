import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.tsx'],
    esbuildOptions: (opts) => {
      opts.jsx = 'preserve'
      opts.outExtension = { '.js': '.jsx' }
      opts.entryNames = '[name]'
    },
    target: 'esnext',
    format: 'esm',
    splitting: false,
  },
])
