use swc_core::{
    common::DUMMY_SP,
    ecma::ast::{
        Expr, JSXClosingElement, JSXElement, JSXElementChild, JSXElementName, JSXExpr,
        JSXOpeningElement,
    },
};

use crate::helpers::ident;
/**
 * Takes a vector of elements as input:
 * Either returns the child when there is only one, or wraps the children in a div and returns it
 */
pub fn transform_elements(children: &Vec<JSXElementChild>) -> Expr {
    // This function is way too clone heavy
    let mut child_elems: Vec<JSXElement> = vec![];
    for child in children {
        // Kinda janky
        if let JSXElementChild::JSXExprContainer(c) = child {
            if let JSXExpr::Expr(e) = &c.expr {
                return *e.clone();
            }
        }
        if let JSXElementChild::JSXElement(element) = child {
            child_elems.push(*element.clone());
        }
    }
    if child_elems.len() == 1 {
        Expr::JSXElement(Box::new(child_elems[0].clone()))
    } else {
        // Wrap in a div
        Expr::JSXElement(Box::new(JSXElement {
            span: DUMMY_SP,
            opening: JSXOpeningElement {
                span: DUMMY_SP,
                self_closing: false,
                type_args: None,
                attrs: vec![],
                name: JSXElementName::Ident(ident("div")),
            },
            children: children.to_vec(),
            closing: Some(JSXClosingElement {
                span: DUMMY_SP,
                name: JSXElementName::Ident(ident("div")),
            }),
        }))
    }
}
