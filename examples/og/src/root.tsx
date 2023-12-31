// @refresh reload
import { Suspense } from 'solid-js'
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from 'solid-start'
import './root.css'
import { DynamicImage, OpenGraph } from '@solid-mediakit/og'

export default function Root() {
  return (
    <Html lang='en'>
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset='utf-8' />
        <Meta name='viewport' content='width=device-width, initial-scale=1' />
        <OpenGraph origin='123'>
          <DynamicImage>
            <div>123</div>
          </DynamicImage>
        </OpenGraph>
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <A href='/'>Index</A>
            <A href='/about'>About</A>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  )
}
