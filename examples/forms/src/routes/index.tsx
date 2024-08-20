import { Show, createEffect, type VoidComponent } from 'solid-js'
import { z } from 'zod'
import { createForm } from '@solid-mediakit/forms'

const Home: VoidComponent = () => {
  const { RenderTestForm, testFieldErrors, testValues } = createForm({
    schema: z.object({
      name: z.string().min(1),
      test: z.string().min(1),
      num: z.number().min(10),
      checked: z.boolean(),
    }),
    name: 'test',
    defaultValues: {
      name: 'default name',
      test: 'default test',
      num: 30,
      checked: true,
    },
  })

  createEffect(() => {
    console.log('t$$', testValues())
  })

  return (
    <div class='flex flex-col gap-2 items-center justify-center py-12 w-full'>
      <Show when={testFieldErrors()}>
        {(e) => {
          return <pre>{JSON.stringify(e(), null, 2)}</pre>
        }}
      </Show>
      <RenderTestForm
        onSubmit={async (input) => {
          console.log(input)
        }}
        onValidationError={(e) => {
          const nameErros = e.name // string[] | undefined
          const testErrors = e.test // string[] | undefined
          console.log('Validation error', { nameErros, testErrors })
        }}
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
      </RenderTestForm>
    </div>
  )
}

export default Home
