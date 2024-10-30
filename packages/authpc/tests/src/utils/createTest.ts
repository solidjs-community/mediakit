import fs from 'fs/promises'
import path from 'path'
import { compilepAuthPC } from '@solid-mediakit/authpc-plugin'
import * as prettier from 'prettier'
import { expect } from 'vitest'

export const createTest = (src: string, second?: boolean) => {
  return async () => {
    const loc = path.join(
      __dirname,
      second ? '../server' : '../caller',
      `${src}.ts`,
    )
    const content = await fs.readFile(loc, 'utf-8')
    const res = await compilepAuthPC(content, loc)
    if (!res?.code) {
      throw new Error('Expected output')
    }
    const formatted = await prettier.format(res.code, {
      parser: 'babel-ts',
      tabWidth: 2,
      singleQuote: true,
      semi: false,
      arrowParens: 'always',
      trailingComma: 'all',
      proseWrap: 'always',
    })
    if (!second) {
      const output = await fs.readFile(
        path.join(__dirname, '../caller', `${src}.output.js`),
        'utf-8',
      )
      expect(formatted).toEqual(output)
    } else {
      await fs.writeFile('output.js', formatted)
    }
  }
}
