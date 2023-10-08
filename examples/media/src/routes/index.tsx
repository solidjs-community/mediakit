import { createVideo } from '@solid-mediakit/media'
import { type VoidComponent } from 'solid-js'

const { Render, play, pause, paused } = createVideo({
  source: 'https://www.w3schools.com/html/mov_bbb.mp4',
  type: 'video/mp4',
})

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
        </button>
      </div>
    </div>
  )
}

export default Home
