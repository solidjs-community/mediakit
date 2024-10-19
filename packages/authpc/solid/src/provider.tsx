import {
  type QueryClient,
  QueryClientProvider,
  type QueryClientProviderProps,
} from '@tanstack/solid-query'
import type { ParentComponent } from 'solid-js'

export const AuthPCProvider: ParentComponent<{
  queryClient: QueryClient
  queryProps?: QueryClientProviderProps
}> = (props) => {
  return (
    <QueryClientProvider client={props.queryClient} {...props.queryProps}>
      {props.children}
    </QueryClientProvider>
  )
}
