import { type Session } from '@auth/core/types'
import { PureAbility, AbilityBuilder } from '@casl/ability'
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma'
import { Todo } from '@prisma/client'
import { createCan } from '../../../packages/casl'

type AppAbility = PureAbility<
  [
    'create' | 'read' | 'update' | 'delete' | 'manage',
    Subjects<{ Todo: Todo; all: never }>
  ],
  PrismaQuery
>

export const ROLES = {
  admin: () => {
    const ability = new AbilityBuilder<AppAbility>(createPrismaAbility)
    ability.can(`manage`, `all`)
    return ability
  },
  public: () => {
    const ability = new AbilityBuilder<AppAbility>(createPrismaAbility)
    ability.can('read', 'Todo', { isPublic: true })
    return ability
  },
  user: (userId: string) => {
    const ability = ROLES.public()
    ability.can('manage', 'Todo', { userId })
    return ability
  },
}

export function getAbilityFromSession(session?: Session | null) {
  if (!session) return ROLES.public().build()

  const userId = session.user.id
  const role = session.user.role

  if (role === `admin`) return ROLES.admin().build()

  return ROLES.user(userId).build()
}

export const Can = createCan<AppAbility>()
