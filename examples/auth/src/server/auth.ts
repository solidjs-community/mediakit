import { type SolidAuthConfig } from '@solid-mediakit/auth'
import Discord from '@auth/core/providers/discord'
import Credentials from '@auth/core/providers/credentials'

declare module '@auth/core/types' {
  export interface Session {
    user: DefaultSession['user']
  }
}

export const authOptions: SolidAuthConfig = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize() {
        await new Promise((res) => setTimeout(res, 3000))
        return {
          name: 'testing',
          email: 'testin@gmail.com',
        }
      },
    }),
  ],
  debug: false,
  basePath: import.meta.env.VITE_AUTH_PATH,
}
