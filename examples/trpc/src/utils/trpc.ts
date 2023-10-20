import { QueryClient } from '@tanstack/solid-query'
import { createTRPCSolidStart } from '@solid-mediakit/trpc'
import { httpBatchLink } from '@trpc/client'
import type { IAppRouter } from '~/server/trpc/router/_app'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCSolidStart<IAppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }
  },
})

export const queryClient = new QueryClient()
