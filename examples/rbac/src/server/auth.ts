import { type SolidAuthConfig } from '@solid-mediakit/auth'
import Discord from '@auth/core/providers/discord'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import { serverEnv } from '~/env/server'

declare module '@auth/core/types' {
  export interface Session {
    user: {
      id: string
      role: `admin` | `user`
    } & DefaultSession['user']
  }
}

export const authOptions: SolidAuthConfig = {
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const userRole = await prisma.userRole.findFirst({
          where: { userId: user.id },
        })

        session.user.id = user.id

        // prisma sqlite doesn't support enums
        session.user.role = (userRole?.role as never) || 'user'
      }
      return session
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: serverEnv.DISCORD_ID,
      clientSecret: serverEnv.DISCORD_SECRET,
    }),
  ],
  debug: false,
}
