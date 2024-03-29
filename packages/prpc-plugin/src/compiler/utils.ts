import * as babel from '@babel/core'

export const addRequestIfNeeded = (
  serverFunction: any,
  isReuseableQuery: boolean,
  isReuseableMutation: boolean,
  middlewares: any[],
  t: typeof babel.types,
  path: babel.NodePath<babel.types.CallExpression>
) => {
  const useMw =
    (middlewares?.length ?? 0) >= 1 || isReuseableQuery || isReuseableMutation
  const shouldAddRequest =
    serverFunction.params[0].properties.some(
      (p: any) => p.key.name === 'event$'
    ) || useMw
  if (shouldAddRequest) {
    serverFunction.body.body.unshift(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('_$$event'),
          t.callExpression(t.identifier('getRequestEvent'), [])
        ),
      ])
    )
    path.traverse({
      Identifier(innerPath: any) {
        if (
          innerPath.node.name === 'event$' &&
          innerPath.scope?.path?.listKey !== 'params'
        ) {
          innerPath.node.name = '_$$event'
        }
      },
    })
  }
}

export const getNodeInfo = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types
) => {
  const { callee } = path.node
  const isReuseableQuery =
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.property, { name: 'query$' })
  const isReuseableMutation =
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.property, { name: 'mutation$' })
  const isMutation =
    t.isIdentifier(callee, { name: 'mutation$' }) || isReuseableMutation
  const isQuery = t.isIdentifier(callee, { name: 'query$' }) || isReuseableQuery
  const isMiddleware = t.isIdentifier(callee, { name: 'middleware$' })
  return {
    isReuseableQuery,
    isReuseableMutation,
    isMiddleware,
    isMutation,
    isQuery,
    callee,
  }
}

type NodeInfo = ReturnType<typeof getNodeInfo>

export const getFunctionArgs = (
  path: babel.NodePath<babel.types.CallExpression>,
  t: typeof babel.types,
  nodeInfo: NodeInfo
) => {
  if (path.node.arguments.length === 1) {
    const arg = path.node.arguments[0]
    if (t.isObjectExpression(arg)) {
      const serverFunction = (
        arg.properties.find(
          (prop: any) =>
            prop.key.name === (nodeInfo.isQuery ? 'queryFn' : 'mutationFn')
        ) as any
      ).value
      const key = (
        arg.properties.find((prop: any) => prop.key.name === 'key') as any
      ).value
      const zodSchema = (
        arg.properties.find((prop: any) => prop.key.name === 'schema') as any
      )?.value
      const middlewares =
        !nodeInfo.isReuseableQuery && !nodeInfo.isReuseableMutation
          ? (
              arg.properties.find(
                (prop: any) => prop.key.name === 'middleware'
              ) as any
            )?.value?.elements.map((e: any) => e.name) ?? []
          : []

      return {
        serverFunction,
        key,
        zodSchema,
        middlewares,
      }
    }
  }
  return null
}

type FnArgs = NonNullable<ReturnType<typeof getFunctionArgs>>

export const cleanOutParams = (
  name: string,
  path: babel.NodePath<babel.types.CallExpression>,
  id: string | ReturnType<typeof babel.types['identifier']>
) => {
  path.traverse({
    Identifier(innerPath: any) {
      if (
        innerPath.node.name === name &&
        innerPath.scope?.path?.listKey !== 'params'
      ) {
        if (innerPath.parentPath.isObjectProperty()) {
          innerPath.parentPath.remove()
          if (
            innerPath.parentPath.parentPath.isVariableDeclarator() &&
            innerPath.parentPath.parentPath.node.id.properties.length === 0
          ) {
            innerPath.parentPath.parentPath.remove()
          }
        } else {
          innerPath.node.name = typeof id === 'string' ? id : id.name
        }
      }
    },
  })
}

export const shiftMiddleware = (
  temp: typeof babel.template,
  t: typeof babel.types,
  serverFunction: any,
  { isReuseableQuery, isReuseableMutation, callee }: NodeInfo,
  args: FnArgs
) => {
  if (args.middlewares?.length || isReuseableQuery || isReuseableMutation) {
    const req = '_$$event'
    let callMiddleware
    if (isReuseableQuery || isReuseableMutation) {
      const name = ((callee as any).object as any).name
      callMiddleware = temp(`const ctx$ = await ${name}.callMw(${req})`)()
    } else {
      callMiddleware = temp(
        `const ctx$ = await callMiddleware$(${req}, %%middlewares%%)`
      )({
        middlewares: args.middlewares.map((m: any) => t.identifier(m)),
      })
    }
    const ifStatement = t.ifStatement(
      t.binaryExpression(
        'instanceof',
        t.identifier('ctx$'),
        t.identifier('Response')
      ),
      t.returnStatement(t.identifier('ctx$'))
    )
    serverFunction.body.body.unshift(callMiddleware, ifStatement)
  }
}
