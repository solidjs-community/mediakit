import { createOpenGraphImage } from '@solid-mediakit/og/server'
import { createMemo } from 'solid-js'
import { createSignal } from 'solid-js'
const DynamicImage1ServerFunction = (...args) => {
  'use server'

  const [r0] = args
  return createOpenGraphImage(<div>{r0}</div>)
}
const DynamicImage1 = (props) => {
  const url = createMemo(() => {
    return (
      DynamicImage1ServerFunction.url.replace('_server', '_server/') +
      `&args=${encodeURIComponent(JSON.stringify(props.values))}`
    )
  })
  return url
}
const [signal] = createSignal('')
const coolVar = DynamicImage1({
  values: [signal()],
})
