import {
  createQuery,
  CreateQueryResult,
  FunctionedParams,
  InvalidateOptions,
  InvalidateQueryFilters,
  Query,
  QueryKey,
  SolidQueryOptions,
  useQueryClient,
} from '@tanstack/solid-query'
import { Accessor } from 'solid-js'
import type {
  DeepPartial,
  EmptySchema,
  ExpectedFn,
  ExpectedSchema,
  Fn$Output,
  IMiddleware,
  Infer$PayLoad,
  OmitQueryData,
  QueryKeyKnown,
} from './types'
import type { PRPCClientError } from './error'
import { tryAndWrap } from './wrap'
import { ZodSchema } from 'zod'

type QueryRes<
  Mw extends IMiddleware[],
  Fn extends ExpectedFn<ZObj, Mw>,
  ZObj extends ExpectedSchema = EmptySchema,
> = {
  useUtils: () => {
    invalidate(
      input?: DeepPartial<Infer$PayLoad<ZObj>>,
      filters?: Omit<InvalidateQueryFilters, 'predicate'> & {
        predicate?: (
          query: Query<
            Infer$PayLoad<ZObj>,
            ZObj extends ZodSchema ? PRPCClientError<ZObj> : PRPCClientError,
            Infer$PayLoad<ZObj>,
            QueryKeyKnown<
              Infer$PayLoad<ZObj>,
              Infer$PayLoad<ZObj> extends { cursor?: any } | void
                ? 'infinite'
                : 'query'
            >
          >,
        ) => boolean
      },
      options?: InvalidateOptions,
    ): Promise<void>
  }
  (
    input: ZObj extends EmptySchema
      ? EmptySchema
      : Accessor<Infer$PayLoad<ZObj>>,
    opts?: FCreateQueryOptions<ZObj, Infer$PayLoad<ZObj>>,
  ): CreateQueryResult<Fn$Output<Fn, ZObj, Mw>>
}

export const query$ = <
  Mw extends IMiddleware[],
  Fn extends ExpectedFn<ZObj, Mw>,
  ZObj extends ExpectedSchema = EmptySchema,
>(
  props: Query$Props<Mw, Fn, ZObj>,
) => {
  const useUtils = () => {
    type R = QueryRes<Mw, Fn, ZObj>
    const queryClient = useQueryClient()

    const queryKey = (input?: any) =>
      input
        ? ['prpc.query', props.key, JSON.stringify(input)]
        : ['prpc.query', props.key]

    return {
      invalidate: (_input, filters, options) => {
        return (queryClient as any).invalidateQueries(
          {
            ...filters,
            queryKey: queryKey(_input),
          },
          options,
        )
      },
    } satisfies ReturnType<R['useUtils']>
  }
  const actualFn = (
    input: ZObj extends EmptySchema
      ? EmptySchema
      : Accessor<Infer$PayLoad<ZObj>>,
    opts?: FCreateQueryOptions<ZObj, Infer$PayLoad<ZObj>>,
  ) => {
    return createQuery(() => ({
      queryFn: async () =>
        await tryAndWrap(props.queryFn, input ? input() : undefined),
      queryKey: [
        'prpc.query',
        props.key,
        input ? JSON.stringify(input()) : undefined,
      ],
      ...((opts?.() ?? {}) as any),
    })) as CreateQueryResult<Fn$Output<Fn, ZObj, Mw>>
  }
  return new Proxy(actualFn, {
    get(target, prop) {
      if (prop === 'useUtils') {
        return useUtils
      }
      return (target as any)[prop]
    },
    apply(target, thisArg, argumentsList) {
      return target.apply(thisArg, argumentsList as any)
    },
  }) as QueryRes<Mw, Fn, ZObj>
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
