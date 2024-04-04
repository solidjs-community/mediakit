import { type SolidAuthConfig } from '@solid-mediakit/auth'
import Discord from '@auth/core/providers/discord'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import { getServerEnv } from '~/env/server'

declare module '@auth/core/types' {
  export interface Session {
    user?: {
      id?: string
    } & DefaultSession['user']
  }
}

export const getAuthOptions = (): SolidAuthConfig => ({
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: getServerEnv().DISCORD_ID,
      clientSecret: getServerEnv().DISCORD_SECRET,
    }),
  ],
  debug: false,
})
