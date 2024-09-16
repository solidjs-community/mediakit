/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ZodSchema, inferFlattenedErrors } from 'zod'

export class MediakitClientError<Zschema extends ZodSchema> extends Error {
  public cause?: inferFlattenedErrors<Zschema> | Error | Record<any, any>
  constructor(
    message: string,
    cause?: inferFlattenedErrors<Zschema> | Error | Record<any, any>,
  ) {
    super(message)
    this.name = 'MediakitlientError'
    this.cause = cause
  }
  isZodError(): this is MediakitClientError<Zschema> & {
    cause: inferFlattenedErrors<Zschema>
  } {
    return this.cause && typeof this.cause === 'object'
      ? 'fieldErrors' in this.cause
      : false
  }
  isError(): this is MediakitClientError<Zschema> & { cause: Error } {
    return this.cause ? this.cause instanceof Error : false
  }
}
