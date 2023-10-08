import { createSignal, createEffect, on, onCleanup } from 'solid-js'
import type { RenderFn, VideoProps } from './types'
import { unwrapValue } from '@solid-mediakit/shared'

const videoCanUnmute = () => {
  if (typeof navigator === 'undefined') return false
  return (
    navigator.userActivation.isActive || navigator.userActivation.hasBeenActive
  )
}

export function createVideo(props: VideoProps) {
  let video: HTMLVideoElement = {} as HTMLVideoElement
  const [paused, setPaused] = createSignal(true)
  const [canBeUnmuted, setCanBeUnmuted] = createSignal(videoCanUnmute())

  const defaultRetry = async () => {
    // video should be muted
    video.muted = true
    await play()
  }

  const Render: RenderFn = (p) => {
    createEffect(
      on(
        () => unwrapValue(p.autoplay),
        async (ap) => {
          if (ap) {
            if (!video.paused) return setPaused(false)
            try {
              await play()
            } catch {
              const onFailedFn = p.onFailed ?? props.onFailed
              if (onFailedFn) {
                await onFailedFn(
                  video,
                  async () => {
                    try {
                      await play()
                    } catch {
                      await defaultRetry()
                    }
                  },
                  canBeUnmuted()
                )
              } else {
                await defaultRetry()
              }
            }
          }
        }
      )
    )

    createEffect(() => {
      const onUserEvent = () => {
        setCanBeUnmuted(videoCanUnmute())
      }
      const events = ['click', 'keydown', 'mousemove']
      events.forEach((e) => document.addEventListener(e, onUserEvent))
      onCleanup(() => {
        events.forEach((e) => document.removeEventListener(e, onUserEvent))
      })
    })

    return (
      <video {...p} ref={(v) => (video = v)} autoplay={unwrapValue(p.autoplay)}>
        <source src={props.source} type={props.type} />
      </video>
    )
  }

  const play = async () => {
    if (!video.paused) return
    await video.play().then(() => setPaused(false))
  }

  const pause = () => {
    if (video.paused) return
    video.pause()
    setPaused(true)
  }

  return { Render, play, pause, paused, canBeUnmuted }
}
