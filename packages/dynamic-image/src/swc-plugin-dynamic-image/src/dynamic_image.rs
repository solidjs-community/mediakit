use swc_core::{
    common::DUMMY_SP,
    ecma::ast::{
        Expr, JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXElement, JSXElementName,
        JSXExpr, JSXExprContainer, JSXOpeningElement,
    },
};

use crate::helpers::ident;

pub fn generate_dynamic_image_use(number: usize, values: Expr) -> JSXElement {
    JSXElement {
        span: DUMMY_SP,
        opening: JSXOpeningElement {
            span: DUMMY_SP,
            self_closing: true,
            attrs: vec![JSXAttrOrSpread::JSXAttr(JSXAttr {
                span: DUMMY_SP,
                name: JSXAttrName::Ident(ident("values")),
                value: Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
                    span: DUMMY_SP,
                    expr: JSXExpr::Expr(Box::new(values)),
                })),
            })],
            type_args: None,
            name: JSXElementName::Ident(ident(&format!("DynamicImage{}", number))),
        },
        children: vec![],
        closing: None,
    }
}
