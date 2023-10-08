import { createVideo } from '@solid-mediakit/media'
import { createSignal, type VoidComponent } from 'solid-js'

const { Render, play, pause, paused, canBeUnmuted } = createVideo({
  source: 'https://www.w3schools.com/html/mov_bbb.mp4',
  type: 'video/mp4',
  // this shouldn't be called
  async onFailed(video, retry) {
    console.log('called onFailed within createVideo')
    video.muted = true
    await retry()
  },
})

const Home: VoidComponent = () => {
  const [renderVideo, setRenderVideo] = createSignal(false)
  return (
    <div class='flex flex-col gap-2 items-center justify-center py-12'>
      <h1 class='text-3xl font-bold'>Home</h1>
      {renderVideo() ? (
        <>
          <h3 class='text-xl font-bold text-gray-400'>
            Status: {paused() ? 'Paused' : 'Playing'}
          </h3>
          <Render
            autoplay
            onFailed={(video, retry) => {
              console.log('called onFailed within Render')
              video.muted = true
              void retry()
            }}
            muted={canBeUnmuted() ? false : true}
          />
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
        </>
      ) : (
        <button
          onClick={() => setRenderVideo(true)}
          class='rounded-lg bg-purple-400 text-white flex items-center justify-center p-3'
        >
          Render Video
        </button>
      )}
    </div>
  )
}

export default Home
