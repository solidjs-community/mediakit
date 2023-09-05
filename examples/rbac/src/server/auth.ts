import { type SolidAuthConfig } from '@solid-mediakit/auth'
// import Discord from '@auth/core/providers/discord'
import Creds from '@auth/core/providers/credentials'

declare module '@auth/core/types' {
  export interface Session {
    user?: DefaultSession['user']
    role?: string
    id?: string
  }
}

export const authOptions: SolidAuthConfig = {
  providers: [
    // Discord({
    //   clientId: process.env.DISCORD_ID,
    //   clientSecret: process.env.DISCORD_SECRET,
    // }),
    Creds({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        console.log(credentials)
        return {
          id: credentials.email as string,
          name: `Dev Agrawal`,
          email: credentials.email as string,
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.id = token.sub
      if (token.sub === 'dev') session.role = 'admin'
      return session
    },
  },
  debug: true,
}
