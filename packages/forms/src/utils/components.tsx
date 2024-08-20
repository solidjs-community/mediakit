import type { Component, JSXElement } from 'solid-js'
import type { ZodSchema, infer as InferZod } from 'zod'
import type { $AllowedChild, $TempField } from '../types'

export const DefaultSubmitButton: Component<{
  sbStyle?: string
}> = ({ sbStyle }) => {
  return (
    <button type='submit' class={sbStyle}>
      Submit
    </button>
  )
}

export const getChild = <
  Z extends ZodSchema,
  SbStyle extends string | undefined,
>(
  children: $AllowedChild<SbStyle, Z>,
  sbStyle: SbStyle,
): {
  Field: (opts: {
    Field: $TempField<Z, InferZod<Z>>
    name: keyof InferZod<Z>
  }) => JSXElement
  SubmitButton: () => JSXElement
} => {
  if (Array.isArray(children)) {
    const [Field, SubmitButton] = children
    return {
      Field,
      SubmitButton: () => SubmitButton,
    }
  }
  return {
    Field: children,
    SubmitButton: () => <DefaultSubmitButton sbStyle={sbStyle} />,
  }
}
