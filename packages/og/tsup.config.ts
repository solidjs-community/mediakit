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
  {
    entry: [
      'src/unplugin/index.ts',
      'src/server/index.ts',
      'src/compiler/index.ts',
			'src/server/prerender.ts'
    ],
    esbuildOptions(opts) {
      opts.entryNames = '[dir]/[name]'
    },
    target: 'esnext',
    format: 'esm',
    splitting: false,
  },
])
