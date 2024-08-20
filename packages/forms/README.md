## Install

```sh
pnpm add @solid-mediakit/forms
```

## Create Form

A way to create a SolidJS `form` is to use the `createForm` function.

```ts
import { z } from 'zod'
import { createForm } from '@solid-mediakit/forms'

const { RenderTestForm, testFieldErrors } = createForm({
  schema: z.object({
    name: z.string().min(1),
    test: z.string().min(1),
  }),
  name: 'test',
})
```

## Variables Name

The returned variables names changed based on the `name` mentioned in the createForm input.

```ts
// name: test
const { RenderTestForm, testFieldErrors, TestField } = createForm({
  schema: z.object({ name: z.string().min(1), test: z.string().min(1) }),
  name: 'test',
})

// name: ok
const { RenderOkForm, okFieldErrors, OkField } = createForm({
  schema: z.object({ name: z.string() }),
  name: 'ok',
})

// no name
const { RenderForm, fieldErrors, Field } = createForm({
  schema: z.object({ name: z.string() }),
})
```

Once created a form, you will be given a function to render the Form automatically, but you will also be given a Field component you could use to render the `<form>` element on your own.

## RenderForm

This is the recommended way of rendering a form, all you need is to render the RenderForm component you received from the `createForm` function.

```tsx
import { type VoidComponent } from 'solid-js'
import { z } from 'zod'
import { createForm } from '@solid-mediakit/forms'

const Home: VoidComponent = () => {
  const { RenderExampleForm, exampleFieldErrors } = createForm({
    schema: z.object({
      name: z.string().min(1),
      test: z.string().min(1),
    }),
    name: 'example',
  })
  return (
    <RenderExampleForm
      onSubmit={async (input) => console.log(input)}
      onValidationError={(e) => console.log('Validation error', e)}
      class='flex p-3 rounded-lg flex-col gap-2 h-[300px] w-[80vw] bg-zinc-800 items-center'
    >
      {({ Field, name }) => {
        // name: name | 'test
        const bgColor = name === 'test' ? 'bg-gray-700' : 'bg-zinc-900'
        return (
          <Field
            inputClass={`${bgColor} p-3 rounded-lg focus:outline-none text-gray-500`}
            labelClass='text-white font-bold text-lg'
            wrapperClass='flex flex-col gap-1'
          />
        )
      }}
      <button class='bg-zinc-900 w-[80%] font-bold rounded-lg p-3 text-white flex items-center justify-center'>
        My Submit
      </button>
    </RenderExampleForm>
  )
}

export default Home
```

### onSubmit

This function will be called with a type-safed required input after validation the input using the provided schema.

```tsx
<RenderExampleForm
  onSubmit={async (input) => {
    console.log(input) // {name: string; test: string;}
  }}
>
{...}
</RenderExampleForm>
```

### onValidationError

This function will be called whenever the schema failed to validate the input.

```tsx
<RenderExampleForm
  onValidationError={(e) => {
    const nameErros = e.name // string[] | undefined
    const testErrors = e.test // string[] | undefined
    console.log('Validation error', { nameErros, testErrors })
  }}
>
{...}
</RenderExampleForm>
```

## validate

This function returned from `createForm` is a function you can use to validate your data manually (i.e when you don't want to use `RenderForm`).

```tsx
<form
  onSubmit={async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const [success, dataOrError] = await validateTest(e.target)
    if (success) {
      console.log('is data', dataOrError)
      // do stuff
    } else {
      console.log('is error', dataOrError)
    }
  }}
></form>
```

Notice again: the name of the variables change based on the `name` property mention in the createForm input.

## Field

You can also create your own forms and use our validation & type-safed Field component

```tsx
import { Show, type VoidComponent } from 'solid-js'
import { z } from 'zod'
import { createForm } from '@solid-mediakit/forms'

const styles = {
  inputClass: 'p-3 bg-zinc-900 rounded-lg focus:outline-none text-gray-500',
  labelClass: 'text-white font-bold text-lg',
  wrapperClass: 'flex flex-col gap-1',
}

const Home: VoidComponent = () => {
  const { testFieldErrors, TestField, validateTest } = createForm({
    schema: z.object({
      name: z.string().min(1),
      test: z.string().min(1),
    }),
    name: 'test',
  })
  return (
    <div>
      <Show when={testFieldErrors()}>
        {(e) => {
          return <pre>{JSON.stringify(e(), null, 2)}</pre>
        }}
      </Show>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          const [success, dataOrError] = await validateTest(e.target)
          if (success) {
            console.log('is data', dataOrError)
            // do stuff
          } else {
            console.log('is error', dataOrError)
          }
        }}
      >
        <TestField name='test' {...styles} />
        <TestField name='name' {...styles} />
        <button type='submit'>My Submit</button>
      </form>
    </div>
  )
}

export default Home
```

## Styling

When using the `Field` component, you can choose to style it however you like:

- inputClass - The class of the input element
- labelClass - The class of the label element
- wrapperClass - The class of the div that wraps the `input` and `label` elements.

```tsx
<Field
  inputClass='p-3 rounded-lg focus:outline-none text-gray-500'
  labelClass='text-white font-bold text-lg'
  wrapperClass='flex flex-col gap-1'
/>
```

Note: This is also relevent to the `Field` component you receieve when using the `RenderForm` method.

## fieldErrors

The createForm function returns a signal that contains the errors of the input, so we can also do something like:

```tsx
<Show when={exampleFieldErrors()}>
  {(e) => {
    return <pre>{JSON.stringify(e(), null, 2)}</pre>
  }}
</Show>
```

Notice again: the name of the variables change based on the `name` property mention in the createForm input.
