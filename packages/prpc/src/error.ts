/* eslint-disable @typescript-eslint/no-explicit-any */
import type { typeToFlattenedError } from 'zod'

export class PRPCClientError<Zschema = any> extends Error {
  public cause?: typeToFlattenedError<Zschema> | Error | Record<any, any>
  constructor(
    message: string,
    cause?: typeToFlattenedError<Zschema> | Error | Record<any, any>
  ) {
    super(message)
    this.name = 'PRPCClientError'
    this.cause = cause
  }
  isZodError(): this is PRPCClientError & {
    cause: typeToFlattenedError<Zschema>
  } {
    return this.cause && typeof this.cause === 'object'
      ? 'fieldErrors' in this.cause
      : false
  }
  isError(): this is PRPCClientError & { cause: Error } {
    return this.cause ? this.cause instanceof Error : false
  }
}
