/* eslint-disable @typescript-eslint/no-explicit-any */
import { type inferFlattenedErrors, type ZodSchema } from 'zod'

export class PRPCClientError<Zschema extends ZodSchema = any> extends Error {
  public cause?: inferFlattenedErrors<Zschema> | Error | Record<any, any>
  constructor(
    message: string,
    cause?: inferFlattenedErrors<Zschema> | Error | Record<any, any>,
  ) {
    super(message)
    this.name = 'PRPCClientError'
    this.cause = cause
  }
  isZodError(): this is PRPCClientError & {
    cause: inferFlattenedErrors<Zschema>
  } {
    return this.cause && typeof this.cause === 'object'
      ? 'fieldErrors' in this.cause
      : false
  }
  isError(): this is PRPCClientError & { cause: Error } {
    return this.cause ? this.cause instanceof Error : false
  }
}
