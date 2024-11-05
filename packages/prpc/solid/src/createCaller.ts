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
import { isRedirectResponse, wrapFn } from './wrap'
import {
  createMutation,
  createQuery,
  useQueryClient,
} from '@tanstack/solid-query'
import { mergeProps } from 'solid-js/web'

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
    return new Proxy(
      (opts?: Action$Options<any, any, any>) => {
        const newOpts = getNewMutationOpts(opts)
        return createMutation(() => {
          return {
            mutationFn: async (input) =>
              await wrapFn(fn, input, actualOpts.method ?? 'POST'),
            mutationKey: ['prpc', 'mutation', key],
            ...((newOpts?.() ?? {}) as any),
          }
        })
      },
      {
        get(target, prop) {
          if (prop === 'raw') {
            return async (input: any) =>
              await wrapFn(fn, input, actualOpts.method ?? 'POST')
          }

          return (target as any)[prop]
        },
      },
    ) as any
  }

  const useUtils = createUseUtils(key)
  return new Proxy(
    (input: any, opts?: GET$Options<undefined, any>) => {
      return createQuery(() => {
        return {
          queryFn: async () =>
            await wrapFn(fn, input, actualOpts.method ?? 'POST'),
          queryKey: ['prpc', 'query', key, input ? input() : undefined],
          experimental_prefetchInRender: true,
          ...((opts?.() ?? {}) as any),
        }
      })
    },
    {
      get(target, prop) {
        if (prop === 'useUtils') {
          return useUtils
        } else if (prop === 'raw') {
          return async (input: any) =>
            await wrapFn(fn, input, actualOpts.method ?? 'POST')
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
      input ? ['prpc', 'query', key, input] : ['prpc', 'query', key]

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

const getNewMutationOpts = (queryOpts?: () => any) => {
  const navigate = (url?: string | null) => void url
  return () =>
    mergeProps(queryOpts?.(), {
      onSuccess: async (data: Response, variables: any, context: any) => {
        if (data instanceof Response) {
          if (isRedirectResponse(data)) {
            navigate(data.headers.get('Location'))
          }
        } else {
          return queryOpts?.().onSuccess?.(data, variables, context)
        }
      },
    })
}
