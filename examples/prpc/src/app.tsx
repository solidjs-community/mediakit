// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import './app.css'
import { QueryClient } from '@tanstack/solid-query'
import { PRPCProvider } from '@solid-mediakit/prpc/provider'

export default function App() {
  const queryClient = new QueryClient()
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Suspense>
            <PRPCProvider queryClient={queryClient}>
              {props.children}
            </PRPCProvider>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
