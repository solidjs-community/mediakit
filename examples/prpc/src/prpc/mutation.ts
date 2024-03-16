import { CreateMutationResult, createMutation } from '@tanstack/solid-query'
import { Accessor } from 'solid-js'
import {
  EmptySchema,
  ExpectedFn,
  ExpectedSchema,
  FCreateMutationOptions,
  Fn$Output,
  Infer$PayLoad,
} from './lib/types'
import { makeKey, unwrapValue } from './lib/helpers'

export type Mutation$Props<
  Fn extends ExpectedFn<ZObj>,
  ZObj extends ExpectedSchema = EmptySchema
> = {
  mutationFn: Fn
  key: string
  schema?: ZObj
}

export const mutation$ = <
  Fn extends ExpectedFn<ZObj>,
  ZObj extends ExpectedSchema = EmptySchema
>(
  props: Mutation$Props<Fn, ZObj>
) => {
  return (opts?: FCreateMutationOptions<Infer$PayLoad<ZObj>>) => {
    return createMutation(() => ({
      mutationFn: (input) => props.mutationFn(unwrapValue(input) as any),
      mutationKey: makeKey('mutation', props.key),
      ...(opts?.() ?? {}),
    })) as CreateMutationResult<Fn$Output<Fn>>
  }
}
