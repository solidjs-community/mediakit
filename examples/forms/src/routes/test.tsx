import { Show, type VoidComponent } from 'solid-js'
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
    <div class='flex flex-col gap-2 items-center justify-center py-12 w-full'>
      <Show when={exampleFieldErrors()}>
        {(e) => {
          return <pre>{JSON.stringify(e(), null, 2)}</pre>
        }}
      </Show>
      <RenderExampleForm
        onSubmit={async (input) => {
          console.log(input) // {name: string; test: string;}
        }}
        onFormError={(e) => {
          if (e.isZodError()) {
            const nameErros = e.cause.fieldErrors.name // string[] | undefined
            const testErrors = e.cause.fieldErrors.test // string[] | undefined
            console.log('Validation error', { nameErros, testErrors })
          } else {
            console.log(e.cause)
          }
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
      </RenderExampleForm>
    </div>
  )
}

export default Home
