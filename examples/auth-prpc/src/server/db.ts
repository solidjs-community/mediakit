import { PrismaClient } from '@prisma/client'
import { isServer } from 'solid-js/web'
import { getServerEnv } from '~/env/server'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const getPrisma = (): PrismaClient => {
  if (isServer) {
    const prisma =
      global.prisma ||
      new PrismaClient({
        log:
          getServerEnv().NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
      })
    if (getServerEnv().NODE_ENV !== 'production') {
      global.prisma = prisma
    }
    return prisma
  }
  return null as any
}
export const prisma = getPrisma()
