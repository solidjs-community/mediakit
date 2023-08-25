import { children, createMemo, type ParentProps } from 'solid-js'
import { Meta } from 'solid-start'
export const DynamicImage = (): JSX.Element => {
  throw new Error('This should be compiled away')
}

export const Image = (props: ParentProps) => {
  const child = children(() => props.children)
  const url = createMemo(() => child()?.toString())
  return <img src={url()}></img>
}

export const OpenGraph = (props: ParentProps & { origin: string }) => {
  const child = children(() => props.children)
  const url = createMemo(() => child()?.toString())
  return <Meta property='og:image' content={props.origin + url()}></Meta>
}