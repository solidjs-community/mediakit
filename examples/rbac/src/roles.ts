/* eslint-disable */
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
    const { build, can } = new AbilityBuilder<AppAbility>(createPrismaAbility)
    can(`manage`, `all`)
    return build()
  },
  user: (userId: string) => {
    const { build, can } = new AbilityBuilder<AppAbility>(createPrismaAbility)
    can('manage', 'Todo', { userId })
    can('read', 'Todo', { isPublic: true })
    return build()
  },
  public: () => {
    const { build, can } = new AbilityBuilder<AppAbility>(createPrismaAbility)
    can('read', 'Todo', { isPublic: true })
    return build()
  },
}

export function getAbilityFromSession(session?: Session | null) {
  if (!session) return ROLES.public()

  const userId = session.user.id
  const role = session.user.role

  if (role === `admin`) return ROLES.admin()

  return ROLES.user(userId)
}

export const Can = createCan<AppAbility>()
