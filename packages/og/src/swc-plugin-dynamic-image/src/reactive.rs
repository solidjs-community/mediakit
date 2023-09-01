use swc_core::{
    common::DUMMY_SP,
    ecma::{
        ast::{Expr, Ident, JSXExpr, JSXExprContainer},
        visit::VisitMut,
    },
};
#[derive(Default)]
pub struct ReactiveVisitor {
    pub reactives: Vec<Box<Expr>>,
}
impl VisitMut for ReactiveVisitor {
    fn visit_mut_jsx_expr_container(&mut self, n: &mut JSXExprContainer) {
        if let JSXExpr::Expr(expr) = n.expr.clone() {
            n.expr = JSXExpr::Expr(Box::new(Expr::Ident(Ident {
                span: DUMMY_SP,
                optional: false,
                sym: format!("r{}", self.reactives.len()).into(),
            })));
            self.reactives.push(expr);
        }
    }
}
