import { useNavigate } from '@solidjs/router'
import { type VoidComponent } from 'solid-js'

const Home: VoidComponent = () => {
  const navigate = useNavigate()
  return (
    <main class='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]'>
      <button onClick={() => navigate('/test')}></button>
    </main>
  )
}

export default Home
