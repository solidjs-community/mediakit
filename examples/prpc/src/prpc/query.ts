import { createQuery } from '@tanstack/solid-query'
import { CreateQueryResult } from '@tanstack/solid-query'
import { Accessor } from 'solid-js'
import {
  EmptySchema,
  ExpectedFn,
  ExpectedSchema,
  FCreateQueryOptions,
  Fn$Output,
  Infer$PayLoad,
} from './lib/types'
import { makeKey, unwrapValue } from './lib/helpers'

export type Query$Props<
  Fn extends ExpectedFn<ZObj>,
  ZObj extends ExpectedSchema = EmptySchema
> = {
  queryFn: Fn
  key: string
  schema?: ZObj
}

export const query$ = <
  Fn extends ExpectedFn<ZObj>,
  ZObj extends ExpectedSchema = EmptySchema
>(
  props: Query$Props<Fn, ZObj>
) => {
  return (
    input: ZObj extends EmptySchema
      ? EmptySchema
      : Accessor<Infer$PayLoad<ZObj>>,
    opts?: FCreateQueryOptions<Infer$PayLoad<ZObj>>
  ) => {
    return createQuery(() => ({
      queryFn: () => props.queryFn(unwrapValue(input) as any),
      queryKey: makeKey('query', props.key, unwrapValue(input)) as any,
      ...((opts?.() ?? {}) as any),
    })) as CreateQueryResult<Fn$Output<Fn>>
  }
}
