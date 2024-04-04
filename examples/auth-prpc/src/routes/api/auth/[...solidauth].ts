import { SolidAuth } from '@solid-mediakit/auth'
import { getAuthOptions } from '~/server/auth'

export const { GET, POST } = SolidAuth(getAuthOptions())
