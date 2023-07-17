import { type VoidComponent } from 'solid-js'
import { HelloComponent } from '@media-kit/solid'

const Home: VoidComponent = () => {
  return (
    <div class='flex flex-col gap-2 items-center my-16'>
      <HelloComponent />
    </div>
  )
}

export default Home
