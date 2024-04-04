import {
  EmptySchema,
  ExpectedFn,
  ExpectedSchema,
  IMiddleware,
  InferFinalMiddlware,
  PossibleBuilderTypes,
  QueryBuilder,
} from './types'

export const builder$ = <
  Fn extends ExpectedFn<ZObj, Mws>,
  Mws extends IMiddleware<any>[] | void = void,
  ZObj extends ExpectedSchema = EmptySchema,
  BuilderType extends PossibleBuilderTypes | void = void
>(): QueryBuilder<Fn, Mws, ZObj, BuilderType> => {
  const builder: QueryBuilder<Fn, Mws, ZObj, PossibleBuilderTypes> = {
    middleware$<Mw extends IMiddleware<InferFinalMiddlware<Mws>>>(_mw: Mw) {
      return builder
    },
    query$<NewFn extends ExpectedFn<ZObj, Mws>>(_fn: NewFn, _key: string) {
      throw new Error('Should be compiled away')
    },
    mutation$<NewFn extends ExpectedFn<ZObj, Mws>>(_fn: NewFn, _key: string) {
      throw new Error('Should be compiled away')
    },
    input<NewZObj extends ExpectedSchema>(schema: NewZObj) {
      return builder as QueryBuilder<
        ExpectedFn<typeof schema, Mws>,
        Mws,
        NewZObj
      >
    },
  }

  return builder as QueryBuilder<Fn, Mws, ZObj, BuilderType>
}
