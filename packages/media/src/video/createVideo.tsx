import { createSignal, createEffect, on, onCleanup } from 'solid-js'
import type { VideoFn, VideoProps } from './types'
import { unwrapValue } from '@solid-mediakit/shared'
import { createEvents } from './events'

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
  const [isVideoLoading, setIsVideoLoading] = createSignal(true)

  const defaultRetry = async () => {
    // video should be muted
    video.muted = true
    await play()
  }

  const Video: VideoFn = (p) => {
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
      const eventsCleanUp = createEvents({
        video,
        videoCanUnmute,
        setCanBeUnmuted,
        setPaused,
        setIsVideoLoading,
      })
      onCleanup(eventsCleanUp)
    })

    return (
      <video {...p} ref={(v) => (video = v)} autoplay={unwrapValue(p.autoplay)}>
        <source src={props.source} type={props.type} />
      </video>
    )
  }

  const play = async () => {
    if (video.ended) {
      video.currentTime = 0
    }
    if (!video.paused) return
    await video.play()
  }

  const pause = () => {
    if (video.paused) return
    video.pause()
  }

  return { Video, play, pause, paused, canBeUnmuted, isVideoLoading }
}
