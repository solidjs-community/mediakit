import {
  FunctionedParams,
  QueryKey,
  SolidMutationOptions,
  SolidQueryOptions,
} from '@tanstack/solid-query'
import type zod from 'zod'

export type EmptySchema = void | undefined

export type ExpectedSchema = zod.ZodSchema | EmptySchema

export type Infer$PayLoad<ZObj extends ExpectedSchema> =
  ZObj extends zod.ZodSchema ? zod.infer<ZObj> : never

export type ExpectedFn<ZObject = EmptySchema> = ZObject extends EmptySchema
  ? (input: Fn$Input) => any
  : ZObject extends zod.ZodSchema
  ? (input: Fn$Input<ZObject>) => any
  : (input: Fn$Input) => any

export type Fn$Input<ZObj extends ExpectedSchema = EmptySchema> = {
  payload: Infer$PayLoad<ZObj>
  request$: Request
}

export type Fn$Output<Fn extends ExpectedFn> = ReturnType<Fn> extends Promise<
  infer T
>
  ? T
  : ReturnType<Fn>

export type FCreateQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = FunctionedParams<
  OmitQueryData<SolidQueryOptions<TQueryFnData, TError, TData, TQueryKey>>
>
export type OmitQueryData<T> = Omit<
  T,
  'queryKey' | 'queryFn' | 'mutationFn' | 'mutationKey'
>

export type FCreateMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> = FunctionedParams<
  OmitQueryData<SolidMutationOptions<TData, TError, TVariables, TContext>>
>
