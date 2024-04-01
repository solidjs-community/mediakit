import { builder$ } from '@solid-mediakit/prpc'

export const helloBuilder = builder$()
  .middleware$(() => {
    console.log('middleware 1')
    return {
      hello: 1,
    }
  })
  .middleware$((ctx) => {
    console.log('middleware 2')
    return {
      ...ctx,
      world: 2,
    }
  })
  .middleware$((ctx) => {
    console.log('middleware 3')
    return {
      ...ctx,
      sdsdgsdg: 'sdg',
    }
  })

export const byeBuilder = builder$()
  .middleware$(() => {
    console.log('bye middleware das')
    return {
      bye: 1,
    }
  })
  .middleware$(() => {
    console.log('bye middleware das 2')
    return {
      hehe: 1,
    }
  })
