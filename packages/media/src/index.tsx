import {
  createSignal,
  type Component,
  type JSX,
  createEffect,
  on,
} from 'solid-js'

type VideoProps = {
  source: string
  type: JSX.SourceHTMLAttributes<HTMLSourceElement>['type']
}

export function createVideo(props: VideoProps) {
  let video: HTMLVideoElement | null = null
  const [paused, setPaused] = createSignal(true)

  const Render: Component<
    JSX.VideoHTMLAttributes<HTMLVideoElement> & { customSource?: JSX.Element }
  > = (p) => {
    createEffect(
      on(
        () => p.autoplay,
        async (ap) => {
          if (ap) {
            if (video && !video.paused) {
              setPaused(false)
              return
            }
            if (video) {
              try {
                await play()
              } catch {
                // video should be muted
                video.muted = true
                await play()
              }
            }
          }
        }
      )
    )
    return (
      <video {...p} ref={(v) => (video = v)}>
        <source src={props.source} type={props.type} />
      </video>
    )
  }

  const play = async () => {
    if (video) {
      if (!video.paused) return
      await video.play().then(() => setPaused(false))
    }
  }
  const pause = () => {
    if (video) {
      if (video.paused) return
      video.pause()
      setPaused(true)
    }
  }

  return { Render, play, pause, paused }
}
