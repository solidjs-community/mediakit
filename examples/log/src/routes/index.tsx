import { Title } from '@solidjs/meta'
import { createSignal } from 'solid-js'
import { log$ } from '@solid-mediakit/log'

export default function Home() {
  const [count, setCount] = createSignal(0)
  log$(count)

  return (
    <main>
      <Title>Hello World</Title>

      <div>
        <button
          class='increment'
          onClick={() => setCount(count() + 1)}
          type='button'
        >
          Clicks: {count()}
        </button>
      </div>
      <p>
        Visit{' '}
        <a href='https://start.solidjs.com' target='_blank'>
          start.solidjs.com
        </a>{' '}
        to learn how to build SolidStart apps.
      </p>
    </main>
  )
}
