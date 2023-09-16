import { createOpenGraphImage, getArguments } from '@solid-mediakit/og/server'
import { createMemo } from 'solid-js'
import server$ from 'solid-start/server'
const DynamicImage1 = (props) => {
  const img = server$(() => {
    const [r0] = getArguments(server$.request.url)
    return createOpenGraphImage(<div>{r0}</div>)
  })
  const url = createMemo(() => {
    return img.url + `?args=${encodeURIComponent(JSON.stringify(props.values))}`
  })
  return <>{url()}</>
}
const coolVar = <DynamicImage1 values={[signal()]} />
