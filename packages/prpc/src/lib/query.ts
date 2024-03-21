import {
  createQuery,
  CreateQueryResult,
  FunctionedParams,
  QueryKey,
  SolidQueryOptions,
} from '@tanstack/solid-query'
import { Accessor } from 'solid-js'
import {
  EmptySchema,
  ExpectedFn,
  ExpectedSchema,
  Fn$Output,
  Infer$PayLoad,
  OmitQueryData,
} from '../types'
import { genHandleResponse, makeKey, tryAndWrap, unwrapValue } from './helpers'
import { PRPCClientError } from './error'

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
        await tryAndWrap(props.queryFn, input, genHandleResponse()),
      queryKey: makeKey('query', props.key, unwrapValue(input)) as any,
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
  TError = PRPCClientError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = FunctionedParams<
  OmitQueryData<
    SolidQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
      initialData?: undefined
    }
  >
>
