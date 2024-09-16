/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormluginOptions } from '.'
import * as babel from '@babel/core'
import { addRequestIfNeeded, cleanOutParams, importIfNotThere } from './utils'

export const formsLoc = `@solid-mediakit/forms`

export function createTransformForm$() {
  const renderFormRegex = /^Render[a-zA-Z]*Form$/
  // const formSchemas: Record<string, any> = {} // Map to store schemas

  return function transformForm$({
    types: t,
    template: temp,
  }: {
    types: typeof babel.types
    template: typeof babel.template
  }): babel.PluginObj {
    return {
      pre(state) {
        ;(state as any).formSchemas = {} // Initialize shared state
      },
      visitor: {
        CallExpression(path, state) {
          if (
            t.isIdentifier(path.node.callee) &&
            path.node.callee.name === 'createForm$'
          ) {
            const schemaProperty = (
              path.node.arguments[0] as any
            )?.properties?.find((prop: any) => prop.key.name === 'schema')

            // Get the component name (RenderTestForm in this case)
            const nameProperty = (
              path.node.arguments[0] as any
            )?.properties?.find((prop: any) => prop.key.name === 'name')

            if (schemaProperty && nameProperty) {
              const componentName =
                `Render${nameProperty.value.value}Form`.toLowerCase()

              ;(state as any).formSchemas = (state as any).formSchemas || {}
              ;(state as any).formSchemas[componentName] = schemaProperty.value
            }
          }
        },
        JSXOpeningElement(path, state) {
          if (
            t.isJSXIdentifier(path.node.name) &&
            renderFormRegex.test(path.node.name.name)
          ) {
            const name = path.node.name.name
            const zodSchema = (state as any).formSchemas[name.toLowerCase()]
            const onSubmitAttr = path.node.attributes.find(
              (attr) =>
                t.isJSXAttribute(attr) &&
                t.isJSXIdentifier(attr.name, {
                  name: 'onSubmit',
                }),
            ) as unknown as babel.types.JSXAttribute
            if (
              onSubmitAttr &&
              t.isJSXExpressionContainer(onSubmitAttr.value) &&
              t.isArrowFunctionExpression(onSubmitAttr.value.expression)
            ) {
              const serverFunction = onSubmitAttr.value.expression

              importIfNotThere(path, t, 'cache', '@solidjs/router')
              importIfNotThere(path, t, 'getRequestEvent', 'solid-js/web')
              const payload = t.objectProperty(
                t.identifier('payload'),
                t.identifier('_$$payload'),
              )
              addRequestIfNeeded(serverFunction, t, path)
              cleanOutParams('payload', path, '_$$payload')
              if (serverFunction?.params) {
                serverFunction.params[0] = t.objectPattern([payload])
              }
              if (
                zodSchema &&
                !t.isIdentifier(zodSchema, { name: 'undefined' })
              ) {
                importIfNotThere(path, t, 'validateZod')
                const asyncParse = temp(
                  `const _$$validatedZod = await validateZod(_$$payload, %%zodSchema%%);`,
                )({ zodSchema: zodSchema }) as babel.types.Statement
                const ifStatement = t.ifStatement(
                  t.binaryExpression(
                    'instanceof',
                    t.identifier('_$$validatedZod'),
                    t.identifier('Response'),
                  ),
                  t.returnStatement(t.identifier('_$$validatedZod')),
                )
                if (t.isBlockStatement(serverFunction.body)) {
                  serverFunction.body.body.unshift(asyncParse, ifStatement)
                }
                path.traverse({
                  Identifier(innerPath: any) {
                    if (
                      innerPath.node.name === '_$$payload' &&
                      innerPath.scope?.path?.listKey !== 'params'
                    ) {
                      if (
                        innerPath.parentPath.node.type !== 'CallExpression' ||
                        innerPath.parentPath.node.callee.name !== 'validateZod'
                      ) {
                        innerPath.node.name = '_$$validatedZod'
                      }
                    }
                  },
                })
              }
              const destructuring = serverFunction?.params?.[0]
              if (destructuring && t.isObjectPattern(destructuring)) {
                destructuring.properties = destructuring.properties.filter(
                  (p: any) => p.key.name !== 'event$' && p.key.name !== 'ctx$',
                )
              }
              const originFn = t.arrowFunctionExpression(
                serverFunction.params,
                serverFunction.body,
                true,
              )
              ;(originFn.body as any).body.unshift(
                t.expressionStatement(t.stringLiteral('use server')),
              )
              const wrappedArg = t.callExpression(t.identifier('cache'), [
                originFn,
                t.stringLiteral(`${name}fn`),
              ])
              onSubmitAttr.value = t.jsxExpressionContainer(wrappedArg)
            }
          }
        },
      },
    }
  }
}

export async function compileForm(
  code: string,
  id: string,
  opts?: FormluginOptions,
) {
  const plugins: babel.ParserOptions['plugins'] = ['typescript', 'jsx']
  const transformForm$ = createTransformForm$()
  const transformed = await babel.transformAsync(code, {
    plugins: [[transformForm$], ...(opts?.babel?.plugins ?? [])],

    presets: [...(opts?.babel?.presets ?? [])],

    parserOpts: {
      plugins,
    },
    filename: id,
  })
  if (transformed) {
    if (opts?.log) {
      console.log(id, transformed.code)
    }
    return {
      code: transformed.code ?? '',
      map: transformed.map,
    }
  }
  return null
}
