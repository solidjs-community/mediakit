import { For, createSignal } from 'solid-js'
import { type ZodSchema } from 'zod'
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

export const createForm = <Z extends ZodSchema, N extends string | undefined>(
  input: $FormInput<Z, N>,
): $FormOutput<Z, N> => {
  const [fieldErrors, setFieldErrors] = createSignal<$ZError<Z> | null>(null)

  const validate$: $Validate<Z> = async (_input, _onSucces, _onError) => {
    setFieldErrors(null)
    const [success, r] = await validateZodSchema(_input, input.schema)
    if (success) {
      await _onSucces?.(r)
      return [true, r]
    } else {
      setFieldErrors(r)
      await _onError?.(r)
      return [false, r]
    }
  }
  const Field: $Field<Z> = ({
    wrapperClass,
    name,
    labelClass,
    inputClass,
    hidePlaceHolder,
  }) => {
    const t = typeof name === 'string' ? name : name.toString()
    return (
      <div class={wrapperClass}>
        <label for={t} class={labelClass}>
          {capitalize(t)}
        </label>
        <input
          id={`${input.name}_${t}`}
          name={t}
          class={inputClass}
          placeholder={hidePlaceHolder ? undefined : capitalize(t)}
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
          await validate$(e.target, onSubmit, onValidationError)
        }}
      >
        <For each={keys}>
          {(key) => {
            return (
              <children.Field
                Field={(props) => <Field {...props} name={key} />}
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
  return {
    [$renderName]: RenderForm,
    [$fieldErrorsName]: fieldErrors,
    [$fieldName]: Field,
    [$validateName]: validate$,
  } as $FormOutput<Z, N>
}
