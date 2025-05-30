import { children, createMemo } from 'solid-js'
import type { JSX, JSXElement, ParentProps } from 'solid-js'
import { Meta } from '@solidjs/meta'
import type { ImageResponseNodeOptions } from '@vercel/og/dist/types'

export const DynamicImage = (_props: {
  children: JSX.Element | (() => JSX.Element | Promise<JSX.Element>)
  imageOptions?: ImageResponseNodeOptions
}): JSX.Element => {
  throw new Error('This should be compiled away')
}

export const Image = (props: ParentProps) => {
  const child = children(() => props.children)
  const url = createMemo(() => child()?.toString())
  return <img src={url()} />
}

export const OpenGraph = (props: ParentProps & { origin: string }) => {
  const child = children(() => props.children)
  const url = createMemo(() => child()?.toString())
  return <Meta property='og:image' content={props.origin + url()}></Meta>
}

export const urlFromImage = (comp: JSXElement): (() => string) => {
  return comp as any
}
