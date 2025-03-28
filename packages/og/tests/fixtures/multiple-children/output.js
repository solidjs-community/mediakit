import { createOpenGraphImage } from '@solid-mediakit/og/server'
import { createMemo } from 'solid-js'
const DynamicImage1 = (props) => {
  const img = (...args) => {
    'use server'

    return createOpenGraphImage(
      <div>
        <div></div>
        <div></div>
      </div>
    )
  }
  const url = createMemo(() => {
    return (
      img.url.replace('_server', '_server/') +
      `&args=${encodeURIComponent(JSON.stringify(props.values))}`
    )
  })
  return url
}
const coolVar = DynamicImage1({
  values: [signal()],
})
