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
  IMiddleware,
  Infer$PayLoad,
  OmitQueryData,
} from './types'
import type { PRPCClientError } from './error'
import { tryAndWrap } from './wrap'
import { ZodSchema } from 'zod'

export const query$ = <
  Mw extends IMiddleware[],
  Fn extends ExpectedFn<ZObj, Mw>,
  ZObj extends ExpectedSchema = EmptySchema,
>(
  props: Query$Props<Mw, Fn, ZObj>,
) => {
  return (
    input: ZObj extends EmptySchema
      ? EmptySchema
      : Accessor<Infer$PayLoad<ZObj>>,
    opts?: FCreateQueryOptions<ZObj, Infer$PayLoad<ZObj>>,
  ) => {
    return createQuery(() => ({
      queryFn: async () =>
        await tryAndWrap(props.queryFn, input ? input() : undefined),
      queryKey: ['prpc.query', props.key, input ? input() : undefined],
      ...((opts?.() ?? {}) as any),
    })) as CreateQueryResult<Fn$Output<Fn, ZObj, Mw>>
  }
}

export type Query$Props<
  Mw extends IMiddleware[],
  Fn extends ExpectedFn<ZObj, Mw>,
  ZObj extends ExpectedSchema = EmptySchema,
> = {
  queryFn: Fn
  key: string
  schema?: ZObj
  middleware?: Mw
}

export type FCreateQueryOptions<
  ZObj extends ExpectedSchema,
  TQueryFnData = unknown,
  TError = ZObj extends ZodSchema ? PRPCClientError<ZObj> : PRPCClientError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = FunctionedParams<
  OmitQueryData<
    SolidQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
      initialData?: undefined
    }
  >
>
