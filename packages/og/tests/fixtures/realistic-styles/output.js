import { createOpenGraphImage } from '@solid-mediakit/og/server'
import { createMemo } from 'solid-js'
const DynamicImage1ServerFunction = (...args) => {
  'use server'

  const [r0] = args
  return createOpenGraphImage(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-size': '128px',
        background: 'lavender',
      }}
    >
      {`👋 Hello, ${r0 * 2}!`}
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
  values: [count()],
})