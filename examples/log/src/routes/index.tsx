/* eslint-disable solid/reactivity */
import { log$ } from '@solid-mediakit/log'
import { createSignal, type VoidComponent } from 'solid-js'

const Home: VoidComponent = () => {
  const [value, setValue] = createSignal('')

  log$(value)

  return (
    <div class='flex flex-col gap-2 items-center justify-center py-12'>
      <h1 class='text-3xl font-bold'>Home</h1>
      <input
        class='border border-gray-400 rounded p-2'
        type='text'
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
      />
    </div>
  )
}

export default Home
