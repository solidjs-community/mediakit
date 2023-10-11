import type { Accessor, Setter } from 'solid-js'
import type { CreateEventFn } from './types'

export const createVideoEvents = (
  setPaused: Setter<boolean>,
  video: HTMLVideoElement
) => {
  const videoEvents = ['play', 'pause', 'ended'] as const
  const onVideoEvent = (e: typeof videoEvents[number]) =>
    setPaused(e === 'play' ? false : e === 'pause' ? true : video.ended)
  videoEvents.forEach((e) => video.addEventListener(e, () => onVideoEvent(e)))

  return () => {
    videoEvents.forEach((e) =>
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
  const videoEventsCleanup = createVideoEvents(props.setPaused, props.video)
  const userEventsCleanup = createUserEvents(
    props.setCanBeUnmuted,
    props.videoCanUnmute
  )
  return () => {
    videoEventsCleanup()
    userEventsCleanup()
  }
}
