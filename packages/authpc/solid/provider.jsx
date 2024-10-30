// src/provider.tsx
import { QueryClientProvider } from '@tanstack/solid-query'
var AuthPCProvider = (props) => {
  return (
    <QueryClientProvider client={props.queryClient} {...props.queryProps}>
      {props.children}
    </QueryClientProvider>
  )
}
export { AuthPCProvider }
