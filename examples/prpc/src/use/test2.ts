import { createCaller, redirect$ } from '@solid-mediakit/prpc'

export const redirectRequet = createCaller(() => redirect$('/test'))
