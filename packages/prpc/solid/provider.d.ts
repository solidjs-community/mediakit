import { QueryClient, QueryClientProviderProps } from '@tanstack/solid-query'
import { ParentComponent } from 'solid-js'

declare const PRPCProvider: ParentComponent<{
  queryClient: QueryClient
  queryProps?: QueryClientProviderProps
}>

export { PRPCProvider }
