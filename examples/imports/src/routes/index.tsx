import { createSignal, VoidComponent, createMemo, createEffect } from 'solid-js'

const Home: VoidComponent = () => {
  // should be transformed
  const [s, setS] = createSignal()

  //   should not be transformed
  const memo = createMemo(() => 1)

  //   should be transformed
  createEffect(() => console.log(s()))
  return <div>hey</div>
}

export default Home
