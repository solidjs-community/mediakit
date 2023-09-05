import { type Session } from '@auth/core/types'
import { defineAbility } from '@casl/ability'

export const ROLES = {
  admin: defineAbility((can) => {
    can('manage', 'all')
  }),
  user: (userId: string) =>
    defineAbility((can) => {
      can('manage', 'Todo', { userId })
    }),
  public: defineAbility((can) => {
    can('read', 'Todo')
  }),
}

export function getAbilityFromSession(session?: Session | null) {
  const userId = session?.id
  const role = session?.role

  if (role === `admin`) return ROLES.admin

  if (userId) return ROLES.user(userId)

  return ROLES.public
}
