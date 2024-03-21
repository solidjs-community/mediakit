import type zod from 'zod'
import type { getRequestEvent } from 'solid-js/web'

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
  event$: NonNullable<ReturnType<typeof getRequestEvent>>
}

export type Fn$Output<Fn extends ExpectedFn> = FilterOutResponse<
  ReturnType<Fn> extends Promise<infer T> ? T : ReturnType<Fn>
>

export type OmitQueryData<T> = Omit<
  T,
  'queryKey' | 'queryFn' | 'mutationFn' | 'mutationKey'
>

export type FilterOutResponse<T> = T extends Response
  ? never
  : T extends object
  ? { [K in keyof T]: FilterOutResponse<T[K]> }
  : T
