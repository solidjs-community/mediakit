import {
  createQuery,
  CreateQueryResult,
  FunctionedParams,
  QueryKey,
  SolidQueryOptions,
} from '@tanstack/solid-query'
import { Accessor } from 'solid-js'
import type {
  EmptySchema,
  ExpectedFn,
  ExpectedSchema,
  Fn$Output,
  Infer$PayLoad,
  OmitQueryData,
} from '@solid-mediakit/prpc'

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
      queryFn: async () =>
        await props.queryFn({ payload: input ? input() : undefined } as any),
      queryKey: ['prpc.query', props.key, input ? input() : undefined],
      ...((opts?.() ?? {}) as any),
    })) as CreateQueryResult<Fn$Output<Fn>>
  }
}

export type Query$Props<
  Fn extends ExpectedFn<ZObj>,
  ZObj extends ExpectedSchema = EmptySchema
> = {
  queryFn: Fn
  key: string
  schema?: ZObj
}

export type FCreateQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = FunctionedParams<
  OmitQueryData<
    SolidQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
      initialData?: undefined
    }
  >
>
