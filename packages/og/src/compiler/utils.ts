/* eslint-disable @typescript-eslint/no-extra-semi */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as babel from '@babel/core'
import { babel as babelUtils } from '@solid-mediakit/shared'

type DynamicImage = {
  element: babel.types.JSXElement
  reactives: number
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
        let child: babel.types.JSXElement | null = null
        for (const ch of elementPath.node.children) {
          if (t.isJSXElement(ch)) {
            child = ch
            break
          }
        }
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
      const img = server$(()=>{
          const %%args%% = getArguments(server$.request.url);
          return createOpenGraphImage(%%jsx%%);
      });
      const url = createMemo(()=>{
          return img.url + \`?args=\${encodeURIComponent(JSON.stringify(props.values))}\`;
      });
      return <>{url()}</>;
  };`,
      { plugins: ['jsx'] }
    )
    const args: babel.types.Identifier[] = []
    for (let i = 0; i < image.reactives; i++) {
      args.push(t.identifier(`r${i}`))
    }
    babelUtils.pushStmts(
      template({
        compName: `DynamicImage${i + 1}`,
        jsx: image.element,
        args: t.arrayPattern(args),
      }),
      path,
      true
    )
  }
}
