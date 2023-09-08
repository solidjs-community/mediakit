import { pluginTester } from 'babel-plugin-tester'
import { transformOG } from '../src/compiler'
import { join } from 'path'
const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
pluginTester({
  plugin: transformOG,
  babelOptions: {
    presets: [['@babel/preset-typescript']],
    parserOpts: {
      plugins,
    },
  },
  fixtures: join(__dirname, 'fixtures'),
})
