import { For, createSignal } from 'solid-js'
import { infer as InferZod, type ZodSchema } from 'zod'
import {
  $Field,
  $FormInput,
  $FormOutput,
  $RenderFormProps,
  $Validate,
  $ZError,
} from './types'
import {
  capitalize,
  getChild,
  getZodKeysAndTypes,
  validateZodSchema,
} from './utils'

export const createForm = <
  Z extends ZodSchema,
  N extends string | undefined,
  dValues extends InferZod<Z> | undefined,
>(
  input: $FormInput<Z, N, dValues>,
): $FormOutput<Z, N, dValues> => {
  const [fieldErrors, setFieldErrors] = createSignal<$ZError<Z> | null>(null)
  const [values, setValues] = createSignal<null | InferZod<Z>>(
    input.defaultValues ?? null,
  )

  const validate$: $Validate<Z> = async (onSucces, onError) => {
    setFieldErrors(null)
    const [success, r] = await validateZodSchema(input.schema, values())
    if (success) {
      await onSucces?.(r)
      return [true, r]
    } else {
      setFieldErrors(r)
      await onError?.(r)
      return [false, r]
    }
  }
  const Field: $Field<Z> = ({
    wrapperClass,
    name,
    labelClass,
    inputClass,
    hidePlaceHolder,
    type,
  }) => {
    const t = typeof name === 'string' ? name : name.toString()
    const additionalProps =
      type === 'boolean'
        ? {
            checked: values()?.[t] ?? false,
          }
        : {}
    return (
      <div class={wrapperClass}>
        <label for={t} class={labelClass}>
          {capitalize(t)}
        </label>
        <input
          id={`${input.name}_${t}`}
          name={t}
          class={inputClass}
          value={values()?.[t] ?? undefined}
          onInput={(e) => {
            const tempE = fieldErrors()
            if (tempE && t in tempE) {
              setFieldErrors((prev) => {
                const copy = { ...prev }
                delete copy?.[t]
                if (Object.keys(copy).length === 0) return null
                return copy as Record<string, string[]>
              })
            }
            setValues((prev) => ({
              ...prev,
              [t]:
                type === 'float'
                  ? parseFloat(e.currentTarget.value)
                  : type === 'number'
                    ? parseInt(e.currentTarget.value)
                    : type === 'boolean'
                      ? e.currentTarget.checked
                      : e.currentTarget.value,
            }))
          }}
          type={
            type === 'string'
              ? 'text'
              : type === 'float' || type === 'number'
                ? 'number'
                : type === 'boolean'
                  ? 'checkbox'
                  : 'text'
          }
          placeholder={hidePlaceHolder ? undefined : capitalize(t)}
          {...additionalProps}
        />
      </div>
    )
  }
  const RenderForm = <SbClass extends string | undefined>({
    children: _children,
    onSubmit,
    onValidationError,
    submitButtonClass,
    ...rest
  }: $RenderFormProps<Z, SbClass>) => {
    const zT = getZodKeysAndTypes(input.schema)
    const keys = Object.keys(zT)
    const children = getChild(_children, submitButtonClass)
    return (
      <form
        {...rest}
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await validate$(onSubmit, onValidationError)
        }}
      >
        <For each={keys}>
          {(key) => {
            return (
              <children.Field
                Field={(props) => (
                  <Field {...props} name={key} type={zT[key].type} />
                )}
                name={key}
              />
            )
          }}
        </For>
        <children.SubmitButton />
      </form>
    )
  }
  const $renderName = `Render${input.name ? capitalize(input.name) : ''}Form`
  const $fieldErrorsName = `${input.name ?? ''}${input.name ? 'F' : 'f'}ieldErrors`
  const $fieldName = `${input.name ? capitalize(input.name) : ''}Field`
  const $validateName = `validate${input.name ? capitalize(input.name) : ''}`
  const $valuesName = `${input.name ?? ''}${input.name ? 'V' : 'v'}alues`
  return {
    [$renderName]: RenderForm,
    [$fieldErrorsName]: fieldErrors,
    [$fieldName]: Field,
    [$validateName]: validate$,
    [$valuesName]: values,
  } as $FormOutput<Z, N, dValues>
}
