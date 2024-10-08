import {
  createQuery,
  CreateQueryResult,
  FunctionedParams,
  QueryKey,
  SolidQueryOptions,
  useQueryClient,
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
  QueryRes,
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
  const useUtils = () => {
    type R = QueryRes<Mw, Fn, ZObj>
    const queryClient = useQueryClient()

    const queryKey = (input?: any) =>
      input ? ['prpc.query', props.key, input] : ['prpc.query', props.key]

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
      cancel(_input, options) {
        return queryClient.cancelQueries(
          {
            queryKey: queryKey(_input),
          },
          options,
        )
      },
      setData(_input, updater, options) {
        return queryClient.setQueryData(
          queryKey(_input),
          updater as any,
          options,
        )
      },
      getData(_input) {
        return queryClient.getQueryData(queryKey(_input))
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
    })) as unknown as CreateQueryResult<
      Fn$Output<Fn, ZObj, Mw>,
      ZObj extends ZodSchema ? PRPCClientError<ZObj> : PRPCClientError
    >
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
