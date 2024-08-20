import type { Accessor, Component, JSX, JSXElement } from 'solid-js'
import type { ZodSchema, infer as InferZod } from 'zod'

export type $FormInput<
  Z extends ZodSchema,
  N extends string | undefined,
  dValues extends InferZod<Z> | undefined,
> = {
  schema: Z
  name?: N
  defaultValues?: dValues
}

export type $FieldInput<Z extends ZodSchema, R = InferZod<Z>> = {
  name: keyof R
  wrapperClass?: string
  labelClass?: string
  inputClass?: string
  hidePlaceHolder?: boolean
  type: $AllowedType
}
export type $Field<Z extends ZodSchema, R = InferZod<Z>> = Component<
  $FieldInput<Z, R>
>

export type $TempField<Z extends ZodSchema, R = InferZod<Z>> = Component<
  Omit<$FieldInput<Z, R>, 'name' | 'type'>
>

export type $AllowedChild<
  submitButtonClass extends string | undefined,
  Z extends ZodSchema,
  R = InferZod<Z>,
> = submitButtonClass extends string
  ? (opts: { Field: $TempField<Z>; name: keyof R }) => JSXElement
  :
      | ((opts: { Field: $TempField<Z>; name: keyof R }) => JSXElement)
      | [(opts: { Field: $TempField<Z>; name: keyof R }) => JSXElement, any]

export type $OnSubmit<Z extends ZodSchema> = (input: InferZod<Z>) => any
export type $OnError<Z extends ZodSchema> = (errors: $ZError<Z>) => any

export type $RenderFormProps<
  Z extends ZodSchema,
  submitButtonClass extends string | undefined,
  R = InferZod<Z>,
> = {
  children: $AllowedChild<submitButtonClass, Z, R>
  onSubmit: $OnSubmit<Z>
  onValidationError?: $OnError<Z>
  submitButtonClass?: submitButtonClass
} & Omit<
  JSX.FormHTMLAttributes<HTMLFormElement>,
  'children' | 'onsubmit' | 'onSubmit'
>
type $RenderForm<Z extends ZodSchema, R = InferZod<Z>> = <
  submitButtonClass extends string | undefined,
>(
  props: $RenderFormProps<Z, submitButtonClass, R>,
) => JSXElement

type NonEmptyString<T extends string> = T extends `${infer _First}${infer _}`
  ? T
  : never

export type $AllowedType =
  | 'string'
  | 'float'
  | 'number'
  | 'boolean'
  | 'date'
  | 'array'
  | 'object'

export type $Validate<Z extends ZodSchema> = (
  onSucces?: $OnSubmit<Z> | undefined,
  onError?: $OnError<Z> | undefined,
) => Promise<[true, InferZod<Z>] | [false, $ZError<Z>]>

export type $FormOutput<
  Z extends ZodSchema,
  N extends string | undefined,
  dValues extends InferZod<Z> | undefined,
> = Record<
  N extends undefined
    ? 'RenderForm'
    : N extends string
      ? NonEmptyString<N> extends never
        ? 'RenderForm'
        : `Render${Capitalize<N>}Form`
      : 'RenderForm',
  $RenderForm<Z>
> &
  Record<
    N extends string ? `${N}FieldErrors` : `fieldErrors`,
    Accessor<$ZError<Z> | null>
  > &
  Record<
    N extends string
      ? NonEmptyString<N> extends never
        ? 'Field'
        : `${Capitalize<N>}Field`
      : `Field`,
    Component<Omit<$FieldInput<Z>, 'type'>>
  > &
  Record<
    N extends string
      ? NonEmptyString<N> extends never
        ? 'validate'
        : `validate${Capitalize<N>}`
      : `validate`,
    $Validate<Z>
  > &
  Record<
    N extends string ? `${N}Values` : `values`,
    Accessor<dValues extends undefined ? null | InferZod<Z> : InferZod<Z>>
  > & {}

export type $ZError<Z extends Zod.ZodSchema> = {
  [K in keyof InferZod<Z>]?: string[]
}
