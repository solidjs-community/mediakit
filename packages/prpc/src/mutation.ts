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
  Infer$PayLoad,
  OmitQueryData,
} from './types'
import type { PRPCClientError } from './error'
import { tryAndWrap } from './wrap'

export const mutation$ = <
  Fn extends ExpectedFn<ZObj>,
  ZObj extends ExpectedSchema = EmptySchema
>(
  props: Mutation$Props<Fn, ZObj>
) => {
  return (opts?: FCreateMutationOptions<Infer$PayLoad<ZObj>>) => {
    return createMutation(() => ({
      mutationFn: async (input) => await tryAndWrap(props.mutationFn, input),
      mutationKey: ['prpc.mutation', props.key],
      ...(opts?.() ?? {}),
    })) as CreateMutationResult<Fn$Output<Fn>>
  }
}

export type Mutation$Props<
  Fn extends ExpectedFn<ZObj>,
  ZObj extends ExpectedSchema = EmptySchema
> = {
  mutationFn: Fn
  key: string
  schema?: ZObj
}

export type FCreateMutationOptions<
  TData = unknown,
  TError = PRPCClientError,
  TVariables = void,
  TContext = unknown
> = FunctionedParams<
  OmitQueryData<SolidMutationOptions<TData, TError, TVariables, TContext>>
>
