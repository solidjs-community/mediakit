import { describe, expect, test } from 'vitest'
import babel from '@babel/core'
import { transformOG } from '../src/compiler'
describe('compiler', () => {
  test('Outputs', async () => {
    const code = 'const yes = <DynamicImage yes="123"><div>{signal()}</div></DynamicImage>;'
    const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
    const transformed = await babel.transformAsync(code, {
      presets: [['@babel/preset-typescript']],
      parserOpts: {
        plugins,
      },
      plugins: [[transformOG]],
      filename: 'index.tsx',
      sourceMaps: true,
      sourceFileName: 'index.tsx',
    })
    console.log(transformed?.code)
    expect(1).toBe(2)
  })
})
