import { DynamicImage } from '@solid-mediakit/og'
import { createSignal } from 'solid-js'

const [signal] = createSignal('')
const coolVar = (
  <DynamicImage yes='123'>
    <div>{signal()}</div>
  </DynamicImage>
)

export default () => {
  return <h1>hey</h1>
}
