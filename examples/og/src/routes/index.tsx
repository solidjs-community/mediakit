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
                "font-size": "40",
                color: 'black',
                background: 'white',
                width: '100%',
                height: '100%',
                padding: '50px 200px',
                "text-align": 'center',
                "justify-content": 'center',
                "background-color": "lavender"
                // "align-items": 'center',
              }}
            >
              {`👋 Hello World!!, ${count()}`}
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
