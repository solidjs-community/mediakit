import {
  QueryClient,
  QueryClientProvider,
  QueryClientProviderProps,
} from '@tanstack/solid-query'
import { ParentComponent } from 'solid-js'

export const PRPCProvider: ParentComponent<{
  queryClient: QueryClient
  queryProps?: QueryClientProviderProps
}> = (props) => {
  return (
    <QueryClientProvider client={props.queryClient} {...props.queryProps}>
      {props.children}
    </QueryClientProvider>
  )
}
