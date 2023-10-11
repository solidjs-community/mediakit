import type { Accessor, Setter } from 'solid-js'
import type { CreateEventFn } from './types'

export const createVideoEvents = (
  setPaused: Setter<boolean>,
  setIsVideoLoading: Setter<boolean>,
  video: HTMLVideoElement
) => {
  const videoEvents = ['play', 'pause', 'ended'] as const
  const loadVideoEvents = ['load', 'loadeddata'] as const

  const allVideoEvents = [...videoEvents, ...loadVideoEvents] as const

  const onVideoEvent = (
    e: typeof videoEvents[number] | typeof loadVideoEvents[number]
  ) => {
    if (videoEvents.includes(e as unknown as typeof videoEvents[number])) {
      setPaused(e === 'play' ? false : e === 'pause' ? true : video.ended)
    } else {
      setIsVideoLoading(e === 'load' ? true : false)
    }
  }

  allVideoEvents.forEach((e) =>
    video.addEventListener(e, () => onVideoEvent(e))
  )
  return () => {
    allVideoEvents.forEach((e) =>
      video.removeEventListener(e, () => onVideoEvent(e))
    )
  }
}

export const createUserEvents = (
  setCanBeUnmuted: Setter<boolean>,
  videoCanUnmute: Accessor<boolean>
) => {
  const events = ['click', 'keydown', 'mousemove'] as const
  const onUserEvent = () => setCanBeUnmuted(videoCanUnmute())
  events.forEach((e) => document.addEventListener(e, onUserEvent))
  return () => {
    events.forEach((e) => document.removeEventListener(e, onUserEvent))
  }
}

export const createEvents: CreateEventFn = (props) => {
  const videoEventsCleanup = createVideoEvents(
    props.setPaused,
    props.setIsVideoLoading,
    props.video
  )
  const userEventsCleanup = createUserEvents(
    props.setCanBeUnmuted,
    props.videoCanUnmute
  )
  return () => {
    videoEventsCleanup()
    userEventsCleanup()
  }
}
