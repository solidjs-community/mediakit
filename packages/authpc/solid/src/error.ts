/* eslint-disable @typescript-eslint/no-explicit-any */
import type { inferFlattenedErrors } from 'zod'
import type { InferIssue, BaseSchema } from 'valibot'
import { AllowedSchemas } from './types'

export type ActualCause<Schema extends AllowedSchemas> =
  undefined extends Schema
    ? Error
    : Schema extends Zod.ZodSchema
      ? inferFlattenedErrors<Schema>
      : Schema extends BaseSchema<any, any, any>
        ? InferIssue<Schema>
        : Error

export type Cause<Schema extends AllowedSchemas> =
  | ActualCause<Schema>
  | Record<any, any>

export class AuthPClientError<
  Schema extends AllowedSchemas = undefined,
> extends Error {
  public cause?: Cause<Schema>
  private _isValidationError?: boolean

  constructor(
    message: string,
    cause?: Cause<Schema>,
    _isValidationError?: boolean,
  ) {
    super(message)
    this.name = 'AuthPClientError'
    this.cause = cause
    this._isValidationError = _isValidationError
  }

  isValidationError(): this is AuthPClientError<Schema> & {
    cause: ActualCause<Schema>
  } {
    return this._isValidationError ?? false
  }

  isError(): this is AuthPClientError & { cause: Error } {
    return this.cause ? this.cause instanceof Error : false
  }
}
