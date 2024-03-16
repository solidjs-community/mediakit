// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import './app.css'
import { QueryClientProvider, QueryClient } from '@tanstack/solid-query'

export default function App() {
  const queryClient = new QueryClient()
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Suspense>
            <QueryClientProvider client={queryClient}>
              {props.children}
            </QueryClientProvider>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
