import { createOpenGraphImage } from '@solid-mediakit/og/server'
import { createMemo } from 'solid-js'
const DynamicImage1ServerFunction = (...args) => {
  'use server'

  return createOpenGraphImage(<div>Hi!</div>, {
    emoji: 'openmoji',
  })
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
DynamicImage1({
  values: [],
})