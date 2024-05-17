/* eslint-disable solid/reactivity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type DehydratedState,
  type CreateInfiniteQueryResult,
  type CreateMutationOptions,
  type CreateMutationResult,
  type CreateQueryResult,
  createInfiniteQuery as __createInfiniteQuery,
  createMutation as __createMutation,
  createQuery as __createQuery,
  type QueryClientProviderProps,
  type QueryClient,
  InfiniteData,
} from '@tanstack/solid-query'
import {
  type CreateTRPCClientOptions,
  type TRPCClient,
  type TRPCClientErrorLike,
  createTRPCClient,
} from '@trpc/client'
import type {
  AnyRouter,
  ProcedureRecord,
  inferHandlerInput,
  inferProcedureClientError,
  inferProcedureInput,
  inferProcedureOutput,
  inferSubscriptionOutput,
} from '@trpc/server'
import { type inferObservableValue } from '@trpc/server/observable'
import {
  type Accessor,
  type Context,
  createEffect,
  type JSX,
  mergeProps,
  onCleanup,
  useContext as __useContext,
  on,
  createMemo,
} from 'solid-js'
import { isServer } from 'solid-js/web'
import {
  TRPCContext,
  type TRPCContextProps,
  type TRPCContextState,
} from '../../internals/context'
import { getArrayQueryKey } from '../../internals/getArrayQueryKey'
import { type CreateTRPCSolidOptions } from '../types'
import {
  type UseTRPCQueryOptions,
  type UseTRPCInfiniteQueryOptions,
  type TRPCUseQueryBaseOptions,
} from './types'
import { getRequestEvent } from 'solid-js/web'
export type OutputWithCursor<TData, TCursor = any> = {
  cursor: TCursor | null
  data: TData
}

export type { TRPCContext, TRPCContextState } from '../../internals/context'

export interface UseTRPCMutationOptions<
  TInput,
  TError,
  TOutput,
  TContext = unknown
> extends CreateMutationOptions<TOutput, TError, TInput, TContext>,
    TRPCUseQueryBaseOptions {}

export interface UseTRPCSubscriptionOptions<TOutput, TError> {
  enabled?: boolean
  onStarted?: () => void
  onData: (data: TOutput) => void
  onError?: (err: TError) => void
}

function getClientArgs<TPathAndInput extends unknown[], TOptions>(
  pathAndInput: TPathAndInput,
  opts: TOptions
) {
  const [path, input] = pathAndInput
  return [path, input, (opts as any)?.trpc] as const
}

type inferInfiniteQueryNames<TObj extends ProcedureRecord> = {
  [TPath in keyof TObj]: inferProcedureInput<TObj[TPath]> extends {
    cursor?: any
  }
    ? TPath
    : never
}[keyof TObj]

type inferProcedures<TObj extends ProcedureRecord> = {
  [TPath in keyof TObj]: {
    input: inferProcedureInput<TObj[TPath]>
    output: inferProcedureOutput<TObj[TPath]>
  }
}

export interface TRPCProviderProps<TRouter extends AnyRouter>
  extends TRPCContextProps<TRouter> {
  children: JSX.Element
}

export type TRPCProvider<TRouter extends AnyRouter> = (
  props: Omit<TRPCProviderProps<TRouter>, 'client'> & {
    queryClientOpts?: Omit<QueryClientProviderProps, 'client'>
  }
) => JSX.Element

export type UseDehydratedState<TRouter extends AnyRouter> = (
  client: TRPCClient<TRouter>,
  trpcState: DehydratedState | undefined
) => Accessor<DehydratedState | undefined>

export type CreateClient<TRouter extends AnyRouter> = (
  opts: (
    event?: ReturnType<typeof getRequestEvent>
  ) => CreateTRPCClientOptions<TRouter>
) => TRPCClient<TRouter>

interface TRPCHookResult {
  trpc: {
    path: string
  }
}

/**
 * @internal
 */
export type UseTRPCQueryResult<TData, TError> = CreateQueryResult<
  TData,
  TError
> &
  TRPCHookResult

/**
 * @internal
 */
export type UseTRPCInfiniteQueryResult<TData, TError> =
  CreateInfiniteQueryResult<InfiniteData<TData>, TError> & TRPCHookResult

/**
 * @internal
 */
export type UseTRPCMutationResult<TData, TError, TVariables, TContext> =
  CreateMutationResult<TData, TError, TVariables, TContext> & TRPCHookResult

/**
 * Create strongly typed react hooks
 * @internal
 */
export function createHooksInternal<TRouter extends AnyRouter>(
  config?: CreateTRPCSolidOptions<TRouter>
) {
  // const mutationSuccessOverride: UseMutationOverride["onSuccess"] =
  //   config?.unstable_overrides?.useMutation?.onSuccess ??
  //   ((options) => options.originalFn());

  type TQueries = TRouter['_def']['queries']
  type TSubscriptions = TRouter['_def']['subscriptions']
  type TMutations = TRouter['_def']['mutations']

  type TError = TRPCClientErrorLike<TRouter>
  type TInfiniteQueryNames = inferInfiniteQueryNames<TQueries>

  type TQueryValues = inferProcedures<TQueries>
  type TMutationValues = inferProcedures<TMutations>

  const Context = (config?.context ?? TRPCContext) as Context<
    TRPCContextState<TRouter> & { client: Accessor<any> }
  >
  const SolidQueryContext = config?.solidQueryContext as Context<
    QueryClient | undefined
  >

  function wrapFn<Fn extends (...args: any[]) => any>(fn: Fn) {
    return async (...args: Parameters<Fn>) => {
      const results = await fn(...args)
      // console.log({ results })
      return results
    }
  }

  const TRPCProvider: TRPCProvider<TRouter> = (props) => {
    const { abortOnUnmount = false, queryClient } = props
    const event = isServer ? getRequestEvent() : undefined
    const client = createMemo(() =>
      createTRPCClient(config?.config(event) as any)
    ) as any
    return (
      <Context.Provider
        value={{
          abortOnUnmount,
          queryClient,
          client,
          fetchQuery: (pathAndInput, opts) => {
            return queryClient.fetchQuery({
              queryKey: getArrayQueryKey(pathAndInput),
              queryFn: wrapFn(() =>
                client().query(...getClientArgs(pathAndInput, opts))
              ),
              ...opts,
            })
          },
          fetchInfiniteQuery: (pathAndInput, opts) => {
            return queryClient.fetchInfiniteQuery({
              queryKey: getArrayQueryKey(pathAndInput),
              queryFn: ({ pageParam }) => {
                const [path, input] = pathAndInput
                const actualInput = { ...(input as any), cursor: pageParam }
                return client().query(
                  ...getClientArgs([path, actualInput], opts)
                )
              },
              initialPageParam: undefined,
              ...opts,
            })
          },

          prefetchQuery: (pathAndInput, opts) => {
            return queryClient.prefetchQuery({
              queryKey: getArrayQueryKey(pathAndInput),
              queryFn: () =>
                client().query(...getClientArgs(pathAndInput, opts)),
            })
          },
          prefetchInfiniteQuery: (pathAndInput, opts) => {
            return queryClient.prefetchInfiniteQuery({
              queryKey: getArrayQueryKey(pathAndInput),
              initialPageParam: undefined,
              queryFn: ({ pageParam }) => {
                const [path, input] = pathAndInput
                const actualInput = { ...(input as any), cursor: pageParam }
                return client().query(
                  ...getClientArgs([path, actualInput], opts)
                )
              },
            })
          },
          ensureQueryData: (pathAndInput, opts) => {
            return queryClient.ensureQueryData({
              queryKey: getArrayQueryKey(pathAndInput),
              queryFn: () =>
                client().query(...getClientArgs(pathAndInput, opts)),
            })
          },
          invalidateQueries: (...args: any[]) => {
            const [queryKey, ...rest] = args
            return queryClient.invalidateQueries({
              queryKey: getArrayQueryKey(queryKey),
              ...rest,
            })
          },
          refetchQueries: (...args: any[]) => {
            const [queryKey, ...rest] = args
            return queryClient.refetchQueries({
              queryKey: getArrayQueryKey(queryKey),
              ...rest,
            })
          },
          cancelQuery: (pathAndInput) => {
            return queryClient.cancelQueries({
              queryKey: getArrayQueryKey(pathAndInput),
            })
          },
          setQueryData: (...args) => {
            const [queryKey, ...rest] = args
            return queryClient.setQueryData(
              getArrayQueryKey(queryKey),
              (input) => {
                if (typeof rest[0] === 'function') {
                  return (rest[0] as any)(input)
                }
                return rest[0]
              }
            )
          },
          getQueryData: (...args) => {
            const [queryKey, ...rest] = args

            return queryClient.getQueryData(getArrayQueryKey(queryKey), ...rest)
          },
          setInfiniteQueryData: (...args) => {
            const [queryKey, ...rest] = args

            return queryClient.setQueryData(
              getArrayQueryKey(queryKey),
              rest as any
            )
          },
          getInfiniteQueryData: (...args) => {
            const [queryKey, ...rest] = args

            return queryClient.getQueryData(getArrayQueryKey(queryKey), ...rest)
          },
        }}
      >
        {props.children}
      </Context.Provider>
    )
  }

  function useContext() {
    return __useContext(Context)
  }

  function createQuery<
    TPath extends keyof TQueryValues & string,
    TQueryFnData = TQueryValues[TPath]['output'],
    TData = TQueryValues[TPath]['output']
  >(
    pathAndInput: () => [
      path: TPath,
      ...args: inferHandlerInput<TQueries[TPath]>
    ],
    opts?: UseTRPCQueryOptions<
      TPath,
      TQueryValues[TPath]['input'],
      TQueryFnData,
      TData,
      TError
    >
  ): UseTRPCQueryResult<TData, TError> {
    const withCtxOpts = () =>
      mergeProps(opts?.() ?? {}, {
        context: SolidQueryContext,
      })
    const ctx = useContext()
    return __createQuery(() => ({
      queryKey: getArrayQueryKey(pathAndInput()),
      queryFn: wrapFn(() => {
        return ctx.client().query(...getClientArgs(pathAndInput(), opts?.()))
      }),
      ...(withCtxOpts() as any),
    })) as UseTRPCQueryResult<TData, TError>
  }

  function createMutation<
    TPath extends keyof TMutationValues & string,
    TContext = unknown
  >(
    path: TPath | [TPath],
    opts?: () => UseTRPCMutationOptions<
      TMutationValues[TPath]['input'],
      TError,
      TMutationValues[TPath]['output'],
      TContext
    >
  ): UseTRPCMutationResult<
    TMutationValues[TPath]['output'],
    TError,
    TMutationValues[TPath]['input'],
    TContext
  > {
    const withCtxOpts = () =>
      mergeProps(opts?.(), {
        context: SolidQueryContext,
      })
    const ctx = useContext()
    return __createMutation(() => ({
      mutationFn: (input) => {
        const actualPath = Array.isArray(path) ? path[0] : path

        return ctx
          .client()
          .mutation(...getClientArgs([actualPath, input], opts?.()))
      },
      ...withCtxOpts(),
    })) as UseTRPCMutationResult<
      TMutationValues[TPath]['output'],
      TError,
      TMutationValues[TPath]['input'],
      TContext
    >
  }

  /* istanbul ignore next */
  /**
   * ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
   *  **Experimental.** API might change without major version bump
   * ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠
   */
  function createSubscription<
    TPath extends keyof TSubscriptions & string,
    TOutput extends inferSubscriptionOutput<TRouter, TPath>
  >(
    pathAndInput: () => [
      path: TPath,
      ...args: inferHandlerInput<TSubscriptions[TPath]>
    ],
    opts: () => UseTRPCSubscriptionOptions<
      inferObservableValue<inferProcedureOutput<TSubscriptions[TPath]>>,
      inferProcedureClientError<TSubscriptions[TPath]>
    >
  ) {
    const ctx = useContext()
    return createEffect(
      on(
        () => [pathAndInput(), opts?.()],
        () => {
          if (!(opts().enabled ?? true)) {
            return
          }
          let isStopped = false

          const subscription = (
            ctx.client() as TRPCClient<AnyRouter>
          ).subscription<
            TRouter['_def']['subscriptions'],
            TPath,
            TOutput,
            inferProcedureInput<TRouter['_def']['subscriptions'][TPath]>
          >(pathAndInput()[0], (pathAndInput()[1] ?? undefined) as any, {
            onStarted: () => {
              if (!isStopped) {
                opts?.()?.onStarted?.()
              }
            },
            onData: (data) => {
              if (!isStopped) {
                opts?.()?.onData(data)
              }
            },
            onError: (err) => {
              if (!isStopped) {
                opts?.()?.onError?.(err)
              }
            },
          })
          onCleanup(() => {
            isStopped = true
            subscription.unsubscribe()
          })
        }
      )
    )
  }

  function createInfiniteQuery<TPath extends TInfiniteQueryNames & string>(
    pathAndInput: () => [
      path: TPath,
      input: Omit<TQueryValues[TPath]['input'], 'cursor'>
    ],
    opts?: UseTRPCInfiniteQueryOptions<
      TPath,
      Omit<TQueryValues[TPath]['input'], 'cursor'>,
      TQueryValues[TPath]['output'],
      TError
    >
  ): UseTRPCInfiniteQueryResult<TQueryValues[TPath]['output'], TError> {
    const withCtxOpts = () =>
      mergeProps(opts?.(), {
        context: SolidQueryContext,
      })
    const ctx = useContext()
    return __createInfiniteQuery(() => ({
      queryKey: getArrayQueryKey(pathAndInput()),
      queryFn: (queryFunctionContext) => {
        const actualInput = {
          ...((pathAndInput()[1] as any) ?? {}),
          cursor: queryFunctionContext.pageParam,
        }

        return ctx
          .client()
          .query(...getClientArgs([pathAndInput()[0], actualInput], opts?.()))
      },
      ...(withCtxOpts() as any),
    })) as UseTRPCInfiniteQueryResult<TQueryValues[TPath]['output'], TError>
  }
  return {
    Provider: TRPCProvider,
    useContext,
    createQuery,
    createMutation,
    createSubscription,
    createInfiniteQuery,
  }
}

/**
 * Hack to infer the type of `createReactQueryHooks`
 * @link https://stackoverflow.com/a/59072991
 */
class GnClass<TRouter extends AnyRouter> {
  fn() {
    return createHooksInternal<TRouter>()
  }
}

type returnTypeInferer<TType> = TType extends (
  a: Record<string, string>
) => infer U
  ? U
  : never
type fooType<TRouter extends AnyRouter> = GnClass<TRouter>['fn']

/**
 * Infer the type of a `createSolidQueryHooks` function
 * @internal
 */
export type CreateSolidQueryHooks<TRouter extends AnyRouter> =
  returnTypeInferer<fooType<TRouter>>
