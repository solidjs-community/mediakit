import { Img } from '@solid-mediakit/media'
import { type VoidComponent } from 'solid-js'

const Home: VoidComponent = () => {
  return (
    <div class='flex flex-col gap-2 items-center justify-center py-12'>
      <h1 class='text-3xl font-bold'>Img</h1>
      <h3 class='text-xl font-bold text-gray-400'>Types</h3>
      <Img
        src='https://cdn.shopify.com/static/sample-images/garnished.jpeg'
        preset='hero'
        width={600}
        height={400}
        alt='This is a hero'
      />
      <Img
        src='https://cdn.shopify.com/static/sample-images/bath_grande_crop_center.jpeg'
        preset='hero'
        width={600}
        height={400}
        alt='This is a hero'
      />
    </div>
  )
}

export default Home
