import {
  EmptySchema,
  ExpectedFn,
  ExpectedSchema,
  Fn$Output,
  IMiddleware,
  Infer$PayLoad,
  InferFinalMiddlware,
  PossibleBuilderTypes,
  QueryBuilder,
} from './types'
import { Accessor } from 'solid-js'
import { FCreateQueryOptions } from './query'
import { FCreateMutationOptions } from './mutation'
import {
  CreateMutationResult,
  CreateQueryResult,
  createMutation,
  createQuery,
} from '@tanstack/solid-query'
import { tryAndWrap } from './wrap'

export const builder$ = <
  Fn extends ExpectedFn<ZObj, Mws>,
  Mws extends IMiddleware<any>[] | void = void,
  ZObj extends ExpectedSchema = EmptySchema,
  BuilderType extends PossibleBuilderTypes | void = void
>(): QueryBuilder<Fn, Mws, ZObj, BuilderType> => {
  let inner: InnerBuilder<Fn, Mws, ZObj, PossibleBuilderTypes> = null as any

  const modifyInner = <
    K extends keyof InnerBuilder<Fn, Mws, ZObj, PossibleBuilderTypes>
  >(
    key: K,
    value: InnerBuilder<Fn, Mws, ZObj, PossibleBuilderTypes>[K]
  ) => {
    if (inner) {
      inner[key] = value as any
    } else {
      inner = {
        [key]: value,
      } as any
    }
  }

  const builder: QueryBuilder<Fn, Mws, ZObj, PossibleBuilderTypes> = {
    middleware$<Mw extends IMiddleware<InferFinalMiddlware<Mws>>>(mw: Mw) {
      return builder as QueryBuilder<
        ExpectedFn<
          ZObj,
          Mws extends IMiddleware[] ? [...Mws, typeof mw] : [typeof mw]
        >,
        Mws extends IMiddleware[] ? [...Mws, typeof mw] : [typeof mw],
        ZObj
      >
    },
    query$<NewFn extends ExpectedFn<ZObj, Mws>>(fn: NewFn, key: string) {
      if (inner?.fn) return builder
      modifyInner('fn', fn as any)
      modifyInner('type', 'query')
      modifyInner('key', key)
      return builder
    },
    mutation$<NewFn extends ExpectedFn<ZObj, Mws>>(fn: NewFn, key: string) {
      if (inner?.fn) return builder
      modifyInner('fn', fn as any)
      modifyInner('type', 'mutation')
      modifyInner('key', key)
      return builder
    },
    input<NewZObj extends ExpectedSchema>(schema: NewZObj) {
      return builder as QueryBuilder<
        ExpectedFn<typeof schema, Mws>,
        Mws,
        NewZObj
      >
    },
    createQuery: (
      input: ZObj extends EmptySchema
        ? EmptySchema
        : Accessor<Infer$PayLoad<ZObj>>,
      opts?: FCreateQueryOptions<Infer$PayLoad<ZObj>>
    ) => {
      return createQuery(() => ({
        queryFn: async () =>
          await tryAndWrap(inner?.fn!, input ? input() : undefined),
        queryKey: ['prpc.query', inner?.key!, input ? input() : undefined],
        ...((opts?.() ?? {}) as any),
      })) as CreateQueryResult<Fn$Output<Fn, ZObj, Mws>>
    },
    createMutation: (opts?: FCreateMutationOptions<Infer$PayLoad<ZObj>>) => {
      return createMutation(() => ({
        mutationFn: async (input) => await tryAndWrap(inner?.fn!, input),
        mutationKey: ['prpc.mutation', inner?.key],
        ...(opts?.() ?? {}),
      })) as CreateMutationResult<Fn$Output<Fn, ZObj, Mws>>
    },
  }

  return builder as QueryBuilder<Fn, Mws, ZObj, BuilderType>
}

type InnerBuilder<
  Fn extends ExpectedFn<ZObj, Mws>,
  Mws extends IMiddleware<any>[] | void = void,
  ZObj extends ExpectedSchema = EmptySchema,
  BuilderType extends PossibleBuilderTypes | void = void
> = {
  fn?: Fn
  key?: string
  type?: BuilderType
}
