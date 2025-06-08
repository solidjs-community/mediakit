import { isServer } from 'solid-js/web'
import { prerenderDynamicImage } from '@solid-mediakit/og/server/prerender'
import { createOpenGraphImage } from '@solid-mediakit/og/server'
import { createMemo } from 'solid-js'
import { createSignal } from 'solid-js'
const DynamicImage1ServerFunction = (...args) => {
  'use server'

  const [r0] = args
  return createOpenGraphImage(<div>{r0}</div>)
}
const DynamicImage1 = (props) => {
  if (isServer) {
    prerenderDynamicImage(
      DynamicImage1ServerFunction,
      props.values,
      'DynamicImage1.png'
    )[0]
  }
  return `/${'DynamicImage1.png'}`
}
const [signal] = createSignal('')
const coolVar = DynamicImage1({
  values: [signal()],
})