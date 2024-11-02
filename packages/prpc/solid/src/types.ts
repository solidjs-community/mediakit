import type { Session } from '@auth/core/types'
import {
  CancelOptions,
  CreateMutationResult,
  CreateQueryResult,
  FunctionedParams,
  InvalidateOptions,
  InvalidateQueryFilters,
  Query,
  QueryKey,
  SetDataOptions,
  SolidMutationOptions,
  SolidQueryOptions,
  Updater,
} from '@tanstack/solid-query'
import { Accessor } from 'solid-js'
import { type RequestEvent } from 'solid-js/web'
import { PRPClientError } from './error'
import type Zod from 'zod'
import { CustomResponse } from '@solidjs/router'
import * as v from 'valibot'
import { Settings } from '.'
import type {
  SignedOutAuthObject,
  SignedInAuthObject,
} from '@clerk/backend/internal'

export type ClerkAuthSession = SignedOutAuthObject | SignedInAuthObject

export type AllowedRequestMethods = 'GET' | 'POST'
export type AllowedFunctionType = 'action' | 'query'

export type AllowedSchemas =
  | Zod.ZodSchema
  | v.BaseSchema<any, any, any>
  | undefined

export type RequiredAllowedSchemas = Exclude<AllowedSchemas, undefined>
export type InferSchema<Schema extends AllowedSchemas> =
  Schema extends Zod.ZodSchema
    ? Zod.infer<Schema>
    : Schema extends v.BaseSchema<any, any, any>
      ? v.InferInput<Schema>
      : void | undefined

export type ExpectedFn$<
  Schema extends AllowedSchemas = undefined,
  IsProtected extends boolean = false,
  Ctx$ = undefined,
> = (
  input: {
    input$: InferSchema<Schema>
    event$: RequestEvent
  } & (Ctx$ extends undefined
    ? {}
    : {
        ctx$: Ctx$
      }) &
    (undefined extends Settings['config']['auth']
      ? {}
      : Settings['config']['auth'] extends 'authjs'
        ? { session$: IsProtected extends true ? Session : Session | null }
        : Settings['config']['auth'] extends 'clerk'
          ? {
              session$: IsProtected extends true
                ? SignedInAuthObject
                : ClerkAuthSession
            }
          : {}),
) => any

export type _InferOutput<Fn extends ExpectedFn$<any, any, any>> = Awaited<
  ReturnType<Fn>
>

export type InferOutput<Fn extends ExpectedFn$<any, any, any>> = Exclude<
  _InferOutput<Fn>,
  CustomResponse<never>
>

export type DeepPartial<TObject> = TObject extends object
  ? {
      [P in keyof TObject]?: DeepPartial<TObject[P]>
    }
  : TObject

export type GET$Options<
  Schema extends AllowedSchemas,
  Output,
> = FunctionedParams<
  Omit<
    SolidQueryOptions<
      Output,
      undefined extends Schema ? PRPClientError : PRPClientError<Schema>,
      InferSchema<Schema>,
      QueryKey
    > & {
      initialData?: undefined
    },
    'queryKey' | 'queryFn'
  >
>

export type Action$Options<
  Ctx,
  Schema extends AllowedSchemas,
  Output,
> = FunctionedParams<
  Omit<
    SolidMutationOptions<
      Output,
      undefined extends Schema ? PRPClientError : PRPClientError<Schema>,
      InferSchema<Schema>,
      Ctx
    > & {
      initialData?: undefined
    },
    'mutationKey' | 'mutationFn'
  >
>

// export type CallerRes<
//   Fn extends ExpectedFn$<Schema, IsProtected, Ctx$>,
//   FnType extends AllowedFunctionType | undefined,
//   IsProtected extends boolean,
//   Schema extends AllowedSchemas = undefined,
//   Ctx$ = undefined,
// > = FnType extends undefined
//   ? QueryRes<Fn, Schema, IsProtected, Ctx$>
//   : FnType extends 'action'
//     ? MutationRes<Fn, Schema, IsProtected, Ctx$>
//     : QueryRes<Fn, Schema, IsProtected, Ctx$>

export type CallerRes<
  Fn extends ExpectedFn$<Schema, IsProtected, Ctx$>,
  FnType extends AllowedFunctionType | undefined,
  IsProtected extends boolean,
  Schema extends AllowedSchemas = undefined,
  Ctx$ = undefined,
> = undefined extends FnType
  ? QueryRes<Fn, Schema, IsProtected, Ctx$>
  : FnType extends 'action'
    ? MutationRes<Fn, Schema, IsProtected, Ctx$>
    : QueryRes<Fn, Schema, IsProtected, Ctx$>

export type ConsumeFnT<
  OriginialFnType extends AllowedFunctionType | undefined = undefined,
  FnType extends AllowedFunctionType | undefined = undefined,
> = undefined extends OriginialFnType ? FnType : OriginialFnType

export type OutputCaller$<
  OriginialFnType extends AllowedFunctionType | undefined = undefined,
  Ctx$ = undefined,
> = {
  <
    FnType extends AllowedFunctionType | undefined,
    RequestMethod extends AllowedRequestMethods | undefined,
    isProtected extends boolean,
    Fn extends ExpectedFn$<undefined, isProtected, Ctx$>,
  >(
    fn: Fn,
    opts?: Create$Opts<
      isProtected,
      RequestMethod,
      undefined extends OriginialFnType ? FnType : OriginialFnType
    >,
  ): CallerRes<
    Fn,
    ConsumeFnT<OriginialFnType, FnType>,
    isProtected,
    undefined,
    Ctx$
  >
  <
    FnType extends AllowedFunctionType | undefined,
    RequestMethod extends AllowedRequestMethods | undefined,
    isProtected extends boolean,
    Schema extends RequiredAllowedSchemas,
    Fn extends ExpectedFn$<Schema, isProtected, Ctx$>,
  >(
    schema: Schema,
    fn: Fn,
    opts?: Create$Opts<
      isProtected,
      RequestMethod,
      undefined extends OriginialFnType ? FnType : OriginialFnType
    >,
  ): CallerRes<
    Fn,
    ConsumeFnT<OriginialFnType, FnType>,
    isProtected,
    Schema,
    Ctx$
  >

  use<R extends object>(
    middleware: MWFn$<R, Ctx$>,
  ): OutputCaller$<OriginialFnType, Exclude<Awaited<R>, CustomResponse<never>>>
}

export type QueryRes<
  Fn extends ExpectedFn$<Schema, IsProtected, Ctx$>,
  Schema extends AllowedSchemas = undefined,
  IsProtected extends boolean = false,
  Ctx$ = undefined,
> = {
  useUtils: () => {
    getData(input?: InferSchema<Schema>): InferOutput<Fn> | undefined
    setData(
      input: InferSchema<Schema>,
      updater: Updater<
        InferOutput<Fn> | undefined,
        InferOutput<Fn> | undefined
      >,
      options?: SetDataOptions,
    ): void

    cancel(input?: InferSchema<Schema>, options?: CancelOptions): Promise<void>
    invalidate(
      input?: DeepPartial<InferSchema<Schema>>,
      filters?: Omit<InvalidateQueryFilters, 'predicate'> & {
        predicate?: (
          query: Query<InferSchema<Schema>, Error, InferSchema<Schema>>,
        ) => boolean
      },
      options?: InvalidateOptions,
    ): Promise<void>
  }
  (
    input: Schema extends undefined
      ? void | undefined
      : Accessor<InferSchema<Schema>>,
    opts?: GET$Options<Schema, InferOutput<Fn>>,
  ): CreateQueryResult<
    InferOutput<Fn>,
    undefined extends Schema ? PRPClientError : PRPClientError<Schema>
  >
}

export type MutationRes<
  Fn extends ExpectedFn$<Schema, IsProtected, Ctx$>,
  Schema extends AllowedSchemas = undefined,
  IsProtected extends boolean = false,
  Ctx$ = undefined,
> = {
  <R>(
    opts?: Action$Options<R, Schema, InferOutput<Fn>>,
  ): CreateMutationResult<
    InferOutput<Fn>,
    undefined extends Schema ? PRPClientError : PRPClientError<Schema>,
    InferSchema<Schema>,
    R
  >
}

export type MWInput$<Ctx$ = undefined> = Ctx$ extends undefined
  ? { event$: RequestEvent }
  : { ctx$: Ctx$; event$: RequestEvent }

export type MWFn$<R extends object, Ctx$ = undefined> = (
  input: MWInput$<Ctx$>,
) => R

export type Create$Opts<
  IsProtected extends boolean,
  RequestMethod extends AllowedRequestMethods | undefined,
  FnType extends AllowedFunctionType | undefined,
> = {
  key?: string
  protected?: IsProtected
  method?: RequestMethod
  type?: FnType
} & (FnType extends undefined
  ? {
      cache?: boolean
    }
  : FnType extends 'action'
    ? {}
    : {
        cache?: boolean
      })

export type OutputGet$<
  IsAction extends boolean,
  RequestMethod extends AllowedRequestMethods | undefined,
  FnType extends AllowedFunctionType | undefined,
  Ctx$ = undefined,
> = {
  <
    isProtected extends boolean,
    Fn extends ExpectedFn$<undefined, isProtected, Ctx$>,
  >(
    fn: Fn,
    opts?: Create$Opts<isProtected, RequestMethod, FnType>,
  ): IsAction extends true
    ? MutationRes<Fn, undefined, isProtected, Ctx$>
    : QueryRes<Fn, undefined, isProtected, Ctx$>
  <
    isProtected extends boolean,
    Schema extends AllowedSchemas,
    Fn extends ExpectedFn$<Schema, isProtected, Ctx$>,
  >(
    schema: Schema,
    fn: Fn,
    opts?: Create$Opts<isProtected, RequestMethod, FnType>,
  ): IsAction extends true
    ? MutationRes<Fn, Schema, isProtected, Ctx$>
    : QueryRes<Fn, Schema, isProtected, Ctx$>

  use<R extends object>(
    middleware: MWFn$<R, Ctx$>,
  ): OutputGet$<IsAction, RequestMethod, FnType, Awaited<R>>
}
