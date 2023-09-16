import { type SolidAuthConfig } from '@solid-mediakit/auth'
import Discord from '@auth/core/providers/discord'
import Credentials from '@auth/core/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import { serverEnv } from '~/env/server'
import console from 'console'

declare module '@auth/core/types' {
  export interface Session {
    user: {
      id: string
      role: `admin` | `user`
    } & DefaultSession['user']
  }
}

export const authOptions: SolidAuthConfig = {
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, user, token }) {
      const userId = user?.id || token.sub || ``

      if (session.user) {
        const userRole = await prisma.userRole.findFirst({
          where: { userId },
        })
        console.log({ userId, userRole })
        session.user.id = userId

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
    Credentials({
      credentials: {
        username: { placeholder: `admin/user` },
        password: { placeholder: `mediakit`, type: `password` },
      },
      authorize({ username, password }) {
        if (password !== `mediakit`) return null

        if (username === `admin`)
          return {
            id: `admin`,
            name: `Administrator`,
            email: `admin@solidjs.com`,
          }
        if (username === `user`)
          return { id: `user`, name: `User`, email: `user@solidjs.com` }

        return null
      },
    }),
  ],
  debug: false,
}
