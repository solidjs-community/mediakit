// @refresh reload
import './app.css'
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { SessionProvider } from '@solid-mediakit/auth/client'

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <SessionProvider>
            <Suspense>{props.children}</Suspense>
          </SessionProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
