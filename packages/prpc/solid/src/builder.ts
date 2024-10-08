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
  Mws extends IMiddleware<any>[] | void = void,
  ZObj extends ExpectedSchema = EmptySchema,
  BuilderType extends PossibleBuilderTypes | void = void,
>(): QueryBuilder<Mws, ZObj, BuilderType> => {
  const builder: QueryBuilder<Mws, ZObj, PossibleBuilderTypes> = {
    middleware$<Mw extends IMiddleware<InferFinalMiddlware<Mws>>>(_mw: Mw) {
      return builder
    },
    query$<NewFn extends ExpectedFn<ZObj, Mws>>(_fn: NewFn, _key: string) {
      throw new Error('Should be compiled away')
    },
    mutation$<NewFn extends ExpectedFn<ZObj, Mws>>(_fn: NewFn, _key: string) {
      throw new Error('Should be compiled away')
    },
    input<NewZObj extends ExpectedSchema>(_schema: NewZObj) {
      return builder as unknown as QueryBuilder<Mws, NewZObj>
    },
  }

  return builder as QueryBuilder<Mws, ZObj, BuilderType>
}
