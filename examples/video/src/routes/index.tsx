/* eslint-disable solid/reactivity */
import {
  createSignal,
  type Component,
  type JSX,
  type JSXElement,
  type VoidComponent,
  createEffect,
  on,
} from 'solid-js'

const sources = [
  {
    source: 'https://www.w3schools.com/html/mov_bbb.mp4',
    type: 'video/mp4',
  },
  {
    source:
      'https://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv',
    type: 'video/ogg',
  },
]
const { Render, play, pause, paused, reset, source } = createVideo(sources[0])

const Home: VoidComponent = () => {
  return (
    <div class='flex flex-col gap-2 items-center justify-center py-12'>
      <h1 class='text-3xl font-bold'>Home</h1>
      <h3 class='text-xl font-bold text-gray-400'>
        Status: {paused() ? 'Paused' : 'Playing'}
      </h3>
      <Render autoplay />
      <div class='flex gap-2 items-center'>
        <button
          onClick={play}
          class='rounded-lg bg-purple-400 text-white flex items-center justify-center p-3'
        >
          Play
        </button>
        <button
          onClick={pause}
          class='rounded-lg bg-purple-400 text-white flex items-center justify-center p-3'
        >
          Pause
        </button>{' '}
      </div>
      <button
        onClick={() =>
          reset(source() === sources[0].source ? sources[1] : sources[0])
        }
        class='rounded-lg bg-purple-400 text-white flex items-center justify-center p-3'
      >
        Change Source
      </button>
    </div>
  )
}

export default Home

type VideoProps = {
  source: string
  type: JSX.SourceHTMLAttributes<HTMLSourceElement>['type']
}

function createVideo(props: VideoProps) {
  let video: HTMLVideoElement | null = null
  const [paused, setPaused] = createSignal(true)
  const [source, setSource] = createSignal(props.source)
  const [type, setType] = createSignal(props.type)

  const reset = (newProps: VideoProps) => {
    setType(newProps.type)
    setSource(newProps.source)
  }

  createEffect(
    on(
      () => [source(), type()],
      (newS) => {
        const [newSource, newType] = newS
        if (newSource !== props.source || newType !== props.type) {
          setPaused(true)
          video?.load()
          if (video?.autoplay) {
            setPaused(false)
          }
        }
      }
    )
  )

  const Render: Component<
    JSX.VideoHTMLAttributes<HTMLVideoElement> & { customSource?: JSXElement }
  > = (p) => {
    if (p.autoplay) {
      setPaused(false)
    }
    return (
      <video {...p} ref={(v) => (video = v)}>
        <source src={source()} type={type()} />
      </video>
    )
  }

  const play = () => {
    if (video) {
      void video.play().then(() => setPaused(false))
    }
  }
  const pause = () => {
    if (video) {
      video.pause()
      setPaused(true)
    }
  }

  return { Render, play, pause, paused, setSource, setType, reset, source }
}
