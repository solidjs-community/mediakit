import type { $ZError } from '../types'
import {
  ZodTypeAny,
  ZodOptional,
  ZodNullable,
  ZodArray,
  ZodObject,
  ZodType,
  SafeParseSuccess,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodDate,
} from 'zod'

export const validateZodSchema = async <Z extends Zod.Schema>(
  target: (EventTarget & HTMLFormElement) | object,
  schema: Zod.Schema,
): Promise<[true, SafeParseSuccess<any>] | [false, $ZError<Z>]> => {
  const values =
    target instanceof EventTarget
      ? Object.fromEntries(new FormData(target))
      : target
  const results = await schema.safeParseAsync(values)
  if (!results.success) {
    return [false, results.error.flatten().fieldErrors]
  }
  return [true, results.data]
}

type AType = {
  type: string
  innerType?: string | string[] | AType | object
}

const zodTypeToInputType = (zodType: ZodTypeAny): AType => {
  if (zodType instanceof ZodString) return { type: 'string' }
  if (zodType instanceof ZodNumber) return { type: 'number' }
  if (zodType instanceof ZodBoolean) return { type: ' boolean' }
  if (zodType instanceof ZodDate) return { type: 'date' }
  if (zodType instanceof ZodArray) {
    const elementType = zodTypeToInputType(zodType.element)
    return {
      type: 'array',
      innerType: elementType,
    }
  }
  if (zodType instanceof ZodObject) {
    const r: Record<any, any> = {}
    Object.entries(zodType.shape).forEach(([key, value]) => {
      const fieldType = zodTypeToInputType(value as ZodTypeAny)
      r[key] = fieldType
    })
    return {
      type: 'object',
      innerType: r,
    }
  }
  if (zodType instanceof ZodNullable || zodType instanceof ZodOptional)
    return zodTypeToInputType(zodType.unwrap())

  return { type: 'string' } // Default type
}
export const getZodKeysAndTypes = <T extends ZodTypeAny>(
  schema: T,
): Record<string, AType> => {
  const result: Record<string, AType> = {}

  // Helper function to recursively extract keys and their types
  const extractKeysAndTypes = (
    schema: ZodTypeAny,
    prefix: string = '',
  ): void => {
    // Check if schema is nullable or optional
    if (schema instanceof ZodNullable || schema instanceof ZodOptional) {
      extractKeysAndTypes(schema.unwrap(), prefix)
      return
    }

    // Check if schema is an array
    if (schema instanceof ZodArray) {
      const arrayType = zodTypeToInputType(schema)
      const newPrefix = prefix ? `${prefix}` : ''
      result[newPrefix] = arrayType
      extractKeysAndTypes(schema.element, newPrefix)
      return
    }

    // Check if schema is an object
    if (schema instanceof ZodObject) {
      Object.entries(schema.shape).forEach(([key, value]) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key
        if (value instanceof ZodType) {
          result[newPrefix] = zodTypeToInputType(value as ZodTypeAny)
          extractKeysAndTypes(value, newPrefix)
        }
      })
      return
    }
  }

  extractKeysAndTypes(schema)
  return result
}
