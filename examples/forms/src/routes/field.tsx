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
    <div class='flex flex-col gap-2 items-center justify-center py-12 w-full'>
      <Show when={testFieldErrors()}>
        {(e) => {
          return <pre>{JSON.stringify(e(), null, 2)}</pre>
        }}
      </Show>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          const [success, dataOrError] = await validateTest()
          if (success) {
            console.log('is data', dataOrError)
            // do stuff
          } else {
            console.log('is error', dataOrError)
          }
        }}
        class='flex p-3 rounded-lg flex-col gap-2 h-[300px] w-[80vw] bg-zinc-800 items-center'
      >
        <TestField name='test' {...styles} />
        <TestField name='name' {...styles} />
        <button
          type='submit'
          class='bg-zinc-900 w-[80%] font-bold rounded-lg p-3 text-white flex items-center justify-center'
        >
          My Submit
        </button>
      </form>
    </div>
  )
}

export default Home
