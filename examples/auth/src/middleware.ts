import { authMiddleware } from '@solid-mediakit/auth'
import { createMiddleware } from '@solidjs/start/middleware'
import { authOptions } from './server/auth'

export default createMiddleware({
  onRequest: [authMiddleware(true, authOptions)],
})
