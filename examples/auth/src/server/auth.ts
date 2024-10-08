import { type SolidAuthConfig } from '@solid-mediakit/auth'
import Discord from '@auth/core/providers/discord'
import Credentials from '@auth/core/providers/credentials'
import { z } from 'zod'
declare module '@auth/core/types' {
  export interface Session {
    user: DefaultSession['user']
  }
}

const zSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(4),
})

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
      async authorize(credentials) {
        const zData = await zSchema.safeParseAsync(credentials)
        if (!zData.success) {
          throw new Error('No Such User')
        }
        return {
          name: zData.data.email.split('@')[0],
          email: zData.data.email,
        }
      },
    }),
  ],
  debug: false,
  basePath: import.meta.env.VITE_AUTH_PATH,
}
