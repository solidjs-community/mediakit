import { test } from 'vitest'
import { createTest } from './utils/createTest'

test('With Simple Middleware', createTest('withMw'))
test('With Imported Caller', createTest('withImport'))
test('With Imported Caller Which Is Also Imported', createTest('wrapImport'))
test('With 3 Depths Import And Advanced Middleware', createTest('moreWrap'))
// test('With Simple Middleware', createTest('prpc', true))
