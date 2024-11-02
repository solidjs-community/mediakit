import { createComponent, mergeProps } from 'solid-js/web'
import { QueryClientProvider } from '@tanstack/solid-query'

// src/provider.tsx
var PRPCProvider = (props) => {
  return createComponent(
    QueryClientProvider,
    mergeProps(
      {
        get client() {
          return props.queryClient
        },
      },
      () => props.queryProps,
      {
        get children() {
          return props.children
        },
      },
    ),
  )
}

export { PRPCProvider }
