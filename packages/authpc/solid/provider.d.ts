import { QueryClient, QueryClientProviderProps } from '@tanstack/solid-query'
import { ParentComponent } from 'solid-js'

declare const AuthPCProvider: ParentComponent<{
  queryClient: QueryClient
  queryProps?: QueryClientProviderProps
}>

export { AuthPCProvider }
