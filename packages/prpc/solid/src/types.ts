import type zod from 'zod'
import type { getRequestEvent } from 'solid-js/web'
import { Accessor } from 'solid-js'
import { FCreateQueryOptions } from './query'
import {
  CancelOptions,
  CreateMutationResult,
  CreateQueryResult,
  InvalidateOptions,
  InvalidateQueryFilters,
  Query,
  SetDataOptions,
  Updater,
} from '@tanstack/solid-query'
import { FCreateMutationOptions } from './mutation'
import { ZodSchema } from 'zod'
import { PRPCClientError } from './error'

export type EmptySchema = void | undefined

export type ExpectedSchema = zod.ZodSchema | EmptySchema

export type Infer$PayLoad<ZObj extends ExpectedSchema> =
  ZObj extends zod.ZodSchema ? zod.infer<ZObj> : never

export type PRPCEvent = NonNullable<ReturnType<typeof getRequestEvent>>

export type ExpectedFn<
  ZObject = EmptySchema,
  Mw extends IMiddleware<any>[] | void = void,
> = ZObject extends EmptySchema
  ? (input: Fn$Input<ZObject, Mw>) => any
  : ZObject extends zod.ZodSchema
    ? (input: Fn$Input<ZObject, Mw>) => any
    : (input: Fn$Input<never, Mw>) => any

type P = {
  event$: PRPCEvent
}

export type IMiddleware<T = any> = (ctx$: T & P) => any

export type Fn$Input<
  ZObj extends ExpectedSchema = EmptySchema,
  Mw extends IMiddleware<any>[] | void = void,
> = {
  payload: Infer$PayLoad<ZObj>
  event$: PRPCEvent
  ctx$: FilterOutResponse<InferFinalMiddlware<Mw>>
}

export type Fn$Output<
  Fn extends ExpectedFn<ZObject, Mw>,
  ZObject = EmptySchema,
  Mw extends IMiddleware[] | void = void,
> = FilterOutResponse<
  ReturnType<Fn> extends Promise<infer T> ? T : ReturnType<Fn>
>

export type OmitQueryData<T> = Omit<
  T,
  'queryKey' | 'queryFn' | 'mutationFn' | 'mutationKey'
>

export type InferReturnType<T> = T extends (...args: any[]) => infer R
  ? R extends Promise<infer R2>
    ? R2
    : R
  : unknown

export type FilterOutResponse<T> = T extends Response ? never : T

export type FlattenArray<T> = T extends (infer U)[] ? U : T

export type InferFinalMiddlware<Mw extends IMiddleware[] | IMiddleware | void> =
  Mw extends IMiddleware[] ? InferReturnType<TakeLast<Mw>> : InferReturnType<Mw>

type TakeLast<T extends any[]> = T extends [...infer _, infer L] ? L : unknown

export type PossibleBuilderTypes = 'query' | 'mutation'

export type DeepPartial<TObject> = TObject extends object
  ? {
      [P in keyof TObject]?: DeepPartial<TObject[P]>
    }
  : TObject

export type QueryType = 'any' | 'infinite' | 'query'

export type GetQueryProcedureInput<TProcedureInput> =
  | DeepPartial<TProcedureInput>
  | undefined

export type QueryKeyKnown<TInput, TType extends Exclude<QueryType, 'any'>> = [
  string[],
  { input?: GetQueryProcedureInput<TInput>; type: TType }?,
]

export type QueryBuilder<
  Fn extends ExpectedFn<ZObj, Mws>,
  Mws extends IMiddleware<any>[] | void = void,
  ZObj extends ExpectedSchema = EmptySchema,
  BuilderType extends PossibleBuilderTypes | void = void,
> = (BuilderType extends 'query'
  ? {
      (
        input: ZObj extends EmptySchema
          ? EmptySchema
          : Accessor<Infer$PayLoad<ZObj>>,
        opts?: FCreateQueryOptions<ZObj, Infer$PayLoad<ZObj>>,
      ): CreateQueryResult<
        Fn$Output<Fn, ZObj, Mws>,
        ZObj extends ZodSchema ? PRPCClientError<ZObj> : PRPCClientError
      >
    }
  : {}) &
  (BuilderType extends 'mutation'
    ? {
        (
          opts?: FCreateMutationOptions<ZObj, Infer$PayLoad<ZObj>>,
        ): CreateMutationResult<
          Fn$Output<Fn, ZObj, Mws>,
          ZObj extends ZodSchema ? PRPCClientError<ZObj> : PRPCClientError,
          Infer$PayLoad<ZObj>
        >
      }
    : {} & BuilderType extends void
      ? {
          query$<NewFn extends ExpectedFn<ZObj, Mws>>(
            fn: NewFn,
            key: string,
          ): QueryBuilder<NewFn, Mws, ZObj, 'query'>
          mutation$<NewFn extends ExpectedFn<ZObj, Mws>>(
            fn: NewFn,
            key: string,
          ): QueryBuilder<NewFn, Mws, ZObj, 'mutation'>
        }
      : {}) &
  (ZObj extends EmptySchema
    ? {
        input<NewZObj extends ExpectedSchema>(
          schema: NewZObj,
        ): QueryBuilder<ExpectedFn<NewZObj, Mws>, Mws, NewZObj>
      }
    : {}) &
  (BuilderType extends void
    ? {
        middleware$<Mw extends IMiddleware<P & InferFinalMiddlware<Mws>>>(
          mw: Mw,
        ): QueryBuilder<
          ExpectedFn<ZObj, Mws extends IMiddleware[] ? [...Mws, Mw] : [Mw]>,
          Mws extends IMiddleware[] ? [...Mws, Mw] : [Mw],
          ZObj
        >
      }
    : {})

export type QueryRes<
  Mw extends IMiddleware[],
  Fn extends ExpectedFn<ZObj, Mw>,
  ZObj extends ExpectedSchema = EmptySchema,
> = {
  useUtils: () => {
    getData(input?: Infer$PayLoad<ZObj>): Fn$Output<Fn, ZObj, Mw> | undefined
    setData(
      input: Infer$PayLoad<ZObj>,
      updater: Updater<
        Fn$Output<Fn, ZObj, Mw> | undefined,
        Fn$Output<Fn, ZObj, Mw> | undefined
      >,
      options?: SetDataOptions,
    ): void

    cancel(input?: Infer$PayLoad<ZObj>, options?: CancelOptions): Promise<void>
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
