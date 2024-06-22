import { DynamicImage, Image } from '@solid-mediakit/og'
import { Title } from '@solidjs/meta'
import { createSignal } from 'solid-js'

export default function Home() {
  const [count, setCount] = createSignal(0)
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
        <Image>
          <DynamicImage>
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '128px',
                background: 'lavender',
              }}
            >
              {`👋 Hello, ${count() * 2}!`}
            </div>
          </DynamicImage>
        </Image>
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
