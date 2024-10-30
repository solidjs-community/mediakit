import { authMiddleware } from '@solid-mediakit/auth'
import { createMiddleware } from '@solidjs/start/middleware'
import { authOptions } from './auth'

export default createMiddleware({
  onRequest: [authMiddleware(['/'], authOptions)],
})
