import { createVideo } from '@solid-mediakit/media'
import { A } from '@solidjs/router'
import { type VoidComponent } from 'solid-js'

const { Video, play, pause, paused, canBeUnmuted, isVideoLoading } =
  createVideo({
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
  return (
    <div class='flex flex-col gap-2 items-center justify-center py-12'>
      <h1 class='text-3xl font-bold'>Media</h1>
      <A href='/video'>Video</A>
      <A href='/img'>Image</A>
    </div>
  )
}

export default Home
