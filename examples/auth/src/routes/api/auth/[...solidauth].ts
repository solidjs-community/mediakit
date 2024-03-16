import { SolidAuth } from '@solid-mediakit/auth'
import { authOptions } from '../../server/auth'

const { handle } = SolidAuth(authOptions)

export const GET = handle
export const POST = handle
