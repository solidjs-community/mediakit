import { defineConfig } from 'tsup-preset-solid'

export default defineConfig(
  [
    {
      entry: 'src/index.ts',
      devEntry: true,
      serverEntry: true,
    },
  ],
  [
    {
      entry: 'src/query.tsx',
      devEntry: true,
      serverEntry: true,
    },
  ],
  [
    {
      entry: 'src/mutation.tsx',
      devEntry: true,
      serverEntry: true,
    },
  ],
  {
    printInstructions: false,
    writePackageJson: true,
    dropConsole: false,
    cjs: true,
  }
)
