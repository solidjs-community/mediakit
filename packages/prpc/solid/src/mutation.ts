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
import { ZodSchema } from 'zod'

export const mutation$ = <
  Mw extends IMiddleware[],
  Fn extends ExpectedFn<ZObj, Mw>,
  ZObj extends ExpectedSchema = EmptySchema,
>(
  props: Mutation$Props<Mw, Fn, ZObj>,
) => {
  return (opts?: FCreateMutationOptions<ZObj, Infer$PayLoad<ZObj>>) => {
    return createMutation(() => ({
      mutationFn: async (input) => await tryAndWrap(props.mutationFn, input),
      mutationKey: ['prpc.mutation', props.key],
      ...(opts?.() ?? {}),
    })) as CreateMutationResult<Fn$Output<Fn, ZObj, Mw>>
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
  TData = unknown,
  TError = ZObj extends ZodSchema ? PRPCClientError<ZObj> : PRPCClientError,
  TVariables = void,
  TContext = unknown,
> = FunctionedParams<
  OmitQueryData<SolidMutationOptions<TData, TError, TVariables, TContext>>
>
