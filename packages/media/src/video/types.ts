import type { JSX, Component, Accessor } from 'solid-js'

export type VideoProps = {
  source: string
  type: JSX.SourceHTMLAttributes<HTMLSourceElement>['type']
  // if not defined, will try to mute the video
  onFailed?: OnFailedFn
}

export type OnFailedFn = (
  video: HTMLVideoElement,
  retry: () => Promise<void>,
  canBeUnmuted: boolean
) => void | Promise<void>
export type RenderFn = Component<
  Omit<JSX.VideoHTMLAttributes<HTMLVideoElement>, 'autoplay'> & {
    autoplay?:
      | JSX.VideoHTMLAttributes<HTMLVideoElement>['autoplay']
      | Accessor<JSX.VideoHTMLAttributes<HTMLVideoElement>['autoplay']>
  } & {
    onFailed?: OnFailedFn
  }
>
