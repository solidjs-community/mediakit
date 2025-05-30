import { createOpenGraphImage } from '@solid-mediakit/og/server'
import { createMemo } from 'solid-js'
const DynamicImage1ServerFunction = (...args) => {
  'use server'

  return createOpenGraphImage(
    <div
      style={{
        fontSize: '100px',
      }}
    >
      Hello
    </div>
  )
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
const coolVar = DynamicImage1({
  values: [],
})