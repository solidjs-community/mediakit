import { createOpenGraphImage } from '@solid-mediakit/og/server'
import { createMemo } from 'solid-js'
import { createSignal } from 'solid-js'
const DynamicImage1ServerFunction = createServerFn({
  method: 'GET',
  response: 'raw',
}).handler((ctx) => {
  const args = ctx.data.values
  const [r0] = args
  return createOpenGraphImage(<div>{r0}</div>)
})
const DynamicImage1 = (props) => {
  const payload = () => ({
    data: {
      values: props.values,
    },
    context: {},
  })
  const url = createMemo(
    () =>
      `${DynamicImage1ServerFunction.url}?payload=${encodeURIComponent(JSON.stringify(payload()))}&createServerFn&raw`,
  )
  return url
}
const [signal] = createSignal('')
const coolVar = DynamicImage1({
  values: [signal()],
})