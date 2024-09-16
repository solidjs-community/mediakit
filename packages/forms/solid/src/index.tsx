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
import { callServerFn } from './server'
import { MediakitClientError } from './error'

type Server = false
export const createForm = <
  Z extends ZodSchema,
  N extends Server extends true ? string : string | undefined,
  dValues extends InferZod<Z> | undefined,
  // Server extends boolean,
>(
  input: $FormInput<Z, N, dValues, Server>,
): $FormOutput<Z, N, dValues, Server> => {
  const [fieldErrors, setFieldErrors] = createSignal<$ZError<Z> | null>(null)
  const [values, setValues] = createSignal<null | InferZod<Z>>(
    input.defaultValues ?? null,
  )
  const [error, setError] = createSignal<MediakitClientError<Z> | null>(null)

  const validate$: $Validate<Z, Server> = async (onSucces, onError) => {
    setFieldErrors(null)
    if (input.server) {
      await callServerFn<Z>(values(), onSucces!, setFieldErrors, setError)
      return [true, values()]
    } else {
      const [success, r] = await validateZodSchema(input.schema, values())
      try {
        if (success) {
          await onSucces?.(r as unknown as InferZod<Z>)
          return [true, r]
        } else {
          if (r.isZodError()) setFieldErrors(r.cause.fieldErrors)
          await onError?.(r)
          return [false, r]
        }
      } catch (e: any) {
        const newE =
          e instanceof MediakitClientError
            ? e
            : new MediakitClientError(e?.message ?? 'Unknown error', e)
        setError(newE)
        return [false, newE]
      }
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
    onFormError,
    submitButtonClass,
    ...rest
  }: $RenderFormProps<Z, SbClass, InferZod<Z>, Server>) => {
    const zT = getZodKeysAndTypes(input.schema)
    const keys = Object.keys(zT)
    const children = getChild(_children, submitButtonClass)
    return (
      <form
        {...rest}
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await validate$(onSubmit, onFormError)
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
  const $errorName = `${input.name ?? ''}${input.name ? 'E' : 'e'}rror`
  return {
    [$renderName]: RenderForm,
    [$fieldErrorsName]: fieldErrors,
    [$fieldName]: Field,
    [$validateName]: validate$,
    [$valuesName]: values,
    [$errorName]: error,
  } as $FormOutput<Z, N, dValues, Server>
}

export const createForm$ = <
  Z extends ZodSchema,
  N extends string,
  dValues extends InferZod<Z> | undefined,
>(
  input: $FormInput<Z, N, dValues, true>,
): $FormOutput<Z, N, dValues, true> =>
  createForm({ ...input, server: true } as unknown as $FormInput<
    Z,
    N,
    dValues,
    false
  >)

export * from './server'
export * from './error'
