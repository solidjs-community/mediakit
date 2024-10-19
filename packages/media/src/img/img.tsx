import { transformProps, UnpicImageProps } from '@unpic/core'
import { JSX } from 'solid-js/jsx-runtime'

export type ImgProps = UnpicImageProps<JSX.ImgHTMLAttributes<HTMLImageElement>>

export function Img(props: ImgProps): JSX.Element {
  return <img {...transformProps(props)} />
}
