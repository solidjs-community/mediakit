import { createSignal, VoidComponent, createMemo } from 'solid-js'

const Home: VoidComponent = () => {
  const [s, setS] = createSignal()
  createMemo(() => 1)
  return <div>hey</div>
}

export default Home
