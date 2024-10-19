import { SolidAuth } from '@solid-mediakit/auth'
import { authOpts } from '~/server/auth'

export const { GET, POST } = SolidAuth(authOpts)
