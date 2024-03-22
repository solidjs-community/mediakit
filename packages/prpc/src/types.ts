import type zod from 'zod'
import type { getRequestEvent } from 'solid-js/web'

export type EmptySchema = void | undefined

export type ExpectedSchema = zod.ZodSchema | EmptySchema

export type Infer$PayLoad<ZObj extends ExpectedSchema> =
  ZObj extends zod.ZodSchema ? zod.infer<ZObj> : never

export type PRPCEvent = NonNullable<ReturnType<typeof getRequestEvent>>

export type ExpectedFn<
  ZObject = EmptySchema,
  Mw extends IMiddleware[] = []
> = ZObject extends EmptySchema
  ? (input: Fn$Input<ZObject, Mw>) => any
  : ZObject extends zod.ZodSchema
  ? (input: Fn$Input<ZObject, Mw>) => any
  : (input: Fn$Input<never, Mw>) => any

export type IMiddleware<T = any> = (ctx$: T & { event$: PRPCEvent }) => any

export type Fn$Input<
  ZObj extends ExpectedSchema = EmptySchema,
  Mw extends IMiddleware[] = []
> = {
  payload: Infer$PayLoad<ZObj>
  event$: PRPCEvent
  ctx$: FilterOutResponse<InferFinalMiddlware<FlattenArray<Mw>>>
}

export type Fn$Output<
  Fn extends ExpectedFn<ZObject, Mw>,
  ZObject = EmptySchema,
  Mw extends IMiddleware[] = []
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
  : never

export type FilterOutResponse<T> = T extends Response
  ? never
  : T extends object
  ? { [K in keyof T]: FilterOutResponse<T[K]> }
  : T

export type FlattenArray<T> = T extends (infer U)[] ? U : T

export type InferFinalMiddlware<Mw extends IMiddleware[] | IMiddleware> =
  (Mw extends [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...infer _Start,
    infer Last
  ]
    ? InferReturnType<Last>
    : Mw extends IMiddleware
    ? InferReturnType<Mw>
    : Mw extends any[]
    ? InferReturnType<FlattenArray<[...Mw]>>
    : InferReturnType<Mw>) & {}
