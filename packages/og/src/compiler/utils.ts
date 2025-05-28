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
  element: babel.types.JSXElement,
) => {
  const elementChildren = element.children.filter((ch) =>
    t.isJSXElement(ch),
  ) as babel.types.JSXElement[]
  if (!elementChildren.length) return null
  return elementChildren.length === 1
    ? elementChildren[0]
    : t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('div'), []),
      t.jsxClosingElement(t.jsxIdentifier('div')),
      elementChildren,
      false,
    )
}

export const replaceDynamicImages = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>,
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

        const parent = elementPath.parentPath
        const isJsx = parent.isJSXElement() || parent.isJSXFragment()
        elementPath.replaceWith(
          (isJsx ? t.jsxExpressionContainer : t.expressionStatement)(
            t.callExpression(t.identifier(name.name), [
              t.objectExpression([
                t.objectProperty(
                  t.identifier('values'),
                  t.arrayExpression(reactives),
                ),
              ]),
            ]),
          ),
        )
      }
    },
  }

  path.traverse(replaceDynamicImageVisitor)
  return DynamicImages
}
const isDynamic = (t: typeof babel.types, path: babel.NodePath<babel.types.JSXExpressionContainer>) => {
  let isDynamic = false;
  const isDynamicVisitor: babel.Visitor = {
    // Assume expression is dynamic if an identifier is present
    Identifier(path) {
      // Don't mark as dynamic when the identifier is a property in JSON object
      // @ts-expect-error
      if (t.isProperty(path.parent) && path.parent.computed == false) {
        return
      }
      isDynamic = true
    }
  }
  path.traverse(isDynamicVisitor)
  return isDynamic;
}
export const extractAndReplaceReactives = (
  t: typeof babel.types,
  path: babel.NodePath<babel.types.JSXElement>,
) => {
  const Reactives: babel.types.Expression[] = []
  const replaceReactivesVisitor: babel.Visitor = {
    Property(path) {
      if (path.node.type !== "ClassPrivateProperty") {
        const expr = path.node.key;
        if (path.node.computed && expr.type !== "PrivateName") {
          path.node.key = t.identifier(`r${Reactives.length}`)
          Reactives.push(t.cloneNode(expr));
        }
        path.skip();
      }
    },
    // Any call expression could be dynamic so replace
    CallExpression(path) {
      const expr = path.node;
      path.replaceWith(t.identifier(`r${Reactives.length}`))
      Reactives.push(t.cloneNode(expr));
      path.skip();
    },
    Identifier(path) {
      const expr = path.node;
      path.replaceWith(t.identifier(`r${Reactives.length}`))
      Reactives.push(t.cloneNode(expr));
      path.skip();
    }
    // JSXExpressionContainer(path) {
    //   const expr = path.node.expression
    //   if (t.isJSXEmptyExpression(expr)) return
    //   if (!isDynamic(t, path)) return
    //   path.node.expression = t.identifier(`r${Reactives.length}`)
    //   Reactives.push(t.cloneNode(expr))
    // },
  }
  path.traverse(replaceReactivesVisitor)
  return Reactives
}

export const addDynamicImages = (
  images: DynamicImage[],
  t: typeof babel.types,
  path: babel.NodePath<babel.types.Program>,
) => {
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const template = babel.template(
      `const %%serverFnName%% = (...args)=>{
          'use server';
          %%args%%
          return createOpenGraphImage(%%jsx%%);
      };
      const %%compName%% = (props)=>{
      const url = createMemo(()=>{
          return %%serverFnName%%.url.replace("_server", "_server/") + \`&args=\${encodeURIComponent(JSON.stringify(props.values))}\`
      });
      return url;
  };`,
      { plugins: ['jsx'] },
    )
    const args: babel.types.Identifier[] = []
    for (let i = 0; i < image.reactives; i++) {
      args.push(t.identifier(`r${i}`))
    }
    const argsDecl =
      args.length === 0
        ? null
        : t.variableDeclaration('const', [
          t.variableDeclarator(t.arrayPattern(args), t.identifier('args')),
        ])
    babelUtils.pushStmts(
      template({
        compName: `DynamicImage${i + 1}`,
        serverFnName: `DynamicImage${i + 1}ServerFunction`,
        jsx: image.element,
        args: argsDecl,
      }) as any,
      path,
      true,
    )
  }
}
