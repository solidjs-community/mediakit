import type { Session } from '@auth/core/types'

declare module '@solidjs/start/server' {
  interface RequestEventLocals {
    session: Session | null | undefined
  }
}
