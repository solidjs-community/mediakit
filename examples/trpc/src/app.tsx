// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start'
import { Suspense } from 'solid-js'
import './app.css'
import { queryClient, trpc } from './utils/trpc'
import { QueryClientProvider } from '@tanstack/solid-query'

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Suspense>
            <QueryClientProvider client={queryClient}>
              <trpc.Provider queryClient={queryClient}>
                {props.children}
              </trpc.Provider>
            </QueryClientProvider>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
