import type {
  Action$Options,
  AllowedFunctionType,
  AllowedRequestMethods,
  CallerRes,
  Create$Opts,
  ExpectedFn$,
  GET$Options,
  OutputCaller$,
  QueryRes,
} from './types'
import type { ZodSchema, infer as _ZodInfer } from 'zod'
import { wrapFn } from './wrap'
import {
  createMutation,
  createQuery,
  useQueryClient,
} from '@tanstack/solid-query'

export const createCaller = new Proxy(
  (...args: any[]) => {
    return (_ACTION$ as any)(...args)
  },
  {
    get(target, prop, receiver) {
      if (prop === 'use') {
        return () => {
          return createCaller
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  },
) as unknown as OutputCaller$

function _ACTION$<
  isProtected extends boolean,
  RequestMethod extends AllowedRequestMethods | undefined,
  FnType extends AllowedFunctionType | undefined,
  Schema extends ZodSchema,
  Fn extends ExpectedFn$<Schema, isProtected, undefined>,
>(
  schema: Schema,
  fn: Fn,
  opts?: Create$Opts<isProtected, RequestMethod, FnType>,
): CallerRes<Fn, FnType, isProtected, Schema>
function _ACTION$<
  isProtected extends boolean,
  RequestMethod extends AllowedRequestMethods | undefined,
  FnType extends AllowedFunctionType | undefined,
  Fn extends ExpectedFn$<undefined, isProtected, undefined>,
>(
  fn: Fn,
  opts?: Create$Opts<isProtected, RequestMethod, FnType>,
): CallerRes<Fn, FnType, isProtected, undefined>
function _ACTION$(...args: any[]): QueryRes<any, any> {
  const fn = (args.length === 3 ? args[1] : args[0]) as ExpectedFn$<any>
  const actualOpts = (args.length === 3 ? args?.[2] : args?.[1]) as
    | Create$Opts<false, AllowedRequestMethods, AllowedFunctionType>
    | undefined

  const key = actualOpts?.key

  if (!key || typeof key !== 'string') {
    throw new Error('Something went wrong')
  }

  if (actualOpts?.type === 'action') {
    const _fn = (opts?: Action$Options<any, any, any>) => {
      return createMutation(() => ({
        mutationFn: async (input) =>
          await wrapFn(fn, input, actualOpts.method ?? 'POST'),
        mutationKey: ['authpc', 'mutation', key],
        ...((opts?.() ?? {}) as any),
      }))
    }
    return _fn as any
  }
  const useUtils = createUseUtils(key)
  return new Proxy(
    (input: any, opts?: GET$Options<undefined, any>) => {
      return createQuery(() => ({
        queryFn: async () =>
          await wrapFn(fn, input, actualOpts.method ?? 'POST'),
        queryKey: ['authpc', 'query', key, input ? input() : undefined],
        experimental_prefetchInRender: true,
        ...((opts?.() ?? {}) as any),
      }))
    },
    {
      get(target, prop) {
        if (prop === 'useUtils') {
          return useUtils
        }
        return (target as any)[prop]
      },
    },
  ) as CallerRes<any, any, any>
}

export const createUseUtils = (key: string) => {
  const useUtils = () => {
    type R = QueryRes<any, any>
    const queryClient = useQueryClient()

    const queryKey = (input?: any) =>
      input ? ['authpc', 'query', key, input] : ['authpc', 'query', key]

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
  return useUtils
}
