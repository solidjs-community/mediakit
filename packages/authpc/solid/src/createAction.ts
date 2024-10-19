import { infer as _ZodInfer } from 'zod'
import { OutputCaller$ } from './types'
import { createCaller } from './createCaller'

export const createAction = createCaller as unknown as OutputCaller$<'action'>
