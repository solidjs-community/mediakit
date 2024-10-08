import {
  CreateMutationResult,
  FunctionedParams,
  SolidMutationOptions,
  createMutation,
} from '@tanstack/solid-query'
import {
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
import { type ZodSchema } from 'zod'

export const mutation$ = <
  Mw extends IMiddleware[],
  Fn extends ExpectedFn<ZObj, Mw>,
  ZObj extends ExpectedSchema = EmptySchema,
>(
  props: Mutation$Props<Mw, Fn, ZObj>,
) => {
  return <TContext = unknown>(
    opts?: FCreateMutationOptions<ZObj, TContext, Infer$PayLoad<ZObj>>,
  ) => {
    return createMutation(() => ({
      mutationFn: async (input) => await tryAndWrap(props.mutationFn, input),
      mutationKey: ['prpc.mutation', props.key],
      ...(opts?.() ?? {}),
    })) as unknown as CreateMutationResult<
      Fn$Output<Fn, ZObj, Mw>,
      ZObj extends ZodSchema ? PRPCClientError<ZObj> : PRPCClientError,
      Infer$PayLoad<ZObj>
    >
  }
}

export type Mutation$Props<
  Mw extends IMiddleware[],
  Fn extends ExpectedFn<ZObj, Mw>,
  ZObj extends ExpectedSchema = EmptySchema,
> = {
  mutationFn: Fn
  key: string
  schema?: ZObj
  middleware?: Mw
}

export type FCreateMutationOptions<
  ZObj extends ExpectedSchema,
  TContext,
  TData = unknown,
  TError = ZObj extends ZodSchema ? PRPCClientError<ZObj> : PRPCClientError,
  TVariables = Infer$PayLoad<ZObj>,
> = FunctionedParams<
  OmitQueryData<SolidMutationOptions<TData, TError, TVariables, TContext>>
>
