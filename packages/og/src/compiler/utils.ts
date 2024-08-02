/* eslint-disable @typescript-eslint/no-extra-semi */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as babel from '@babel/core'
import { babel as babelUtils } from '@solid-mediakit/shared'

type DynamicImage = {
  element: babel.types.JSXElement
  reactives: number
}

const extractChild = (
  t: typeof babel.types,
  element: babel.types.JSXElement
) => {
  const elementChildren = element.children.filter((ch) =>
    t.isJSXElement(ch)
  ) as babel.types.JSXElement[]
  if (!elementChildren.length) return null
  return elementChildren.length === 1
    ? elementChildren[0]
    : t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('div'), []),
      t.jsxClosingElement(t.jsxIdentifier('div')),
      elementChildren,
      false
    )
}

export const replaceDynamicImages = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>
) => {
  const DynamicImages: DynamicImage[] = []
  const replaceDynamicImageVisitor: babel.Visitor = {
    JSXElement(elementPath) {
      const name = elementPath.node.openingElement.name
      if (t.isJSXIdentifier(name) && name.name === 'DynamicImage') {
        const reactives = extractAndReplaceReactives(t, elementPath)
        const child = extractChild(t, elementPath.node)
        if (!child) throw new Error('DynamicImage must have a child element')
        DynamicImages.push({
          reactives: reactives.length,
          element: t.cloneNode(child),
        })
        elementPath.node.openingElement.selfClosing = true
        elementPath.node.closingElement = null
        name.name = `DynamicImage${DynamicImages.length}`
        elementPath.node.openingElement.attributes = [
          t.jSXAttribute(
            t.jSXIdentifier('values'),
            t.jSXExpressionContainer(t.arrayExpression(reactives))
          ),
        ]
      }
    },
  }

  path.traverse(replaceDynamicImageVisitor)
  return DynamicImages
}

export const extractAndReplaceReactives = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.JSXElement>
) => {
  const Reactives: babel.types.Expression[] = []
  const replaceReactivesVisitor: babel.Visitor = {
    JSXExpressionContainer(path) {
      const expr = path.node.expression
      if (t.isJSXEmptyExpression(expr)) return
      path.node.expression = t.identifier(`r${Reactives.length}`)
      Reactives.push(t.cloneNode(expr))
    },
  }
  path.traverse(replaceReactivesVisitor)
  return Reactives
}

export const addDynamicImages = (
  images: DynamicImage[],
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>
) => {
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const template = babel.template(
      `const %%compName%% = (props)=>{
      const img = (...args)=>{
          'use server';
          %%args%%
          return createOpenGraphImage(%%jsx%%);
      };
      const url = createMemo(()=>{
          return img.url.replace("_server", "_server/") + \`&args=\${encodeURIComponent(JSON.stringify(props.values))}\`
      });
      return <>{url()}</>;
  };`,
      { plugins: ['jsx'] }
    )
    const args: babel.types.Identifier[] = []
    for (let i = 0; i < image.reactives; i++) {
      args.push(t.identifier(`r${i}`))
    }
    const argsDecl =
      args.length === 0
        ? null
        : t.variableDeclaration('const', [
          t.variableDeclarator(
            t.arrayPattern(args),
            t.identifier("args")
          ),
        ])
    babelUtils.pushStmts(
      template({
        compName: `DynamicImage${i + 1}`,
        jsx: image.element,
        args: argsDecl,
      }) as any,
      path,
      true
    )
  }
}
