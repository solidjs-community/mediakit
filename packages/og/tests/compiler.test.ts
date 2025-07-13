import { pluginTester } from 'babel-plugin-tester'
import { transformOG } from '../src/compiler'
import { join } from 'path'
const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
pluginTester({
	pluginName: "OGPlugin",
  plugin: transformOG,
  babelOptions: {
    presets: [['@babel/preset-typescript']],
    parserOpts: {
      plugins,
    },
  },
	// snapshot: true,
  fixtures: join(__dirname, 'fixtures'),
})
