use swc_core::{
    common::DUMMY_SP,
    ecma::ast::{
        ArrayLit, ArrowExpr, BindingIdent, BlockStmt, BlockStmtOrExpr, CallExpr, Callee, Decl,
        Expr, ExprOrSpread, Ident, Pat, Stmt, VarDecl, VarDeclKind, VarDeclarator,
    },
};

pub fn ident(name: &str) -> Ident {
    Ident {
        span: DUMMY_SP,
        sym: name.into(),
        optional: false,
    }
}
pub fn generate_values(reactives: Vec<Box<Expr>>) -> Expr {
    let mut elems: Vec<Option<ExprOrSpread>> = vec![];
    for reactive in reactives {
        elems.push(Some(ExprOrSpread {
            spread: None,
            expr: reactive.clone(),
        }))
    }
    Expr::Array(ArrayLit {
        span: DUMMY_SP,
        elems,
    })
}
pub fn generate_params(reactives: usize) -> Vec<Pat> {
    (0..reactives).fold(vec![], |mut pats, n| {
        pats.push(Pat::Ident(BindingIdent {
            type_ann: None,
            id: ident(&format!("r{n}")),
        }));
        pats
    })
}
pub fn arrow_fn_expr(params: Vec<Pat>, stmts: Vec<Stmt>) -> Expr {
    Expr::Arrow(ArrowExpr {
        span: DUMMY_SP,
        params,
        is_async: false,
        is_generator: false,
        type_params: None,
        return_type: None,
        body: Box::new(BlockStmtOrExpr::BlockStmt(BlockStmt {
            span: DUMMY_SP,
            stmts,
        })),
    })
}
pub fn const_var_decl(name: &str, expr: Expr) -> Decl {
    Decl::Var(Box::new(VarDecl {
        span: DUMMY_SP,
        kind: VarDeclKind::Const,
        declare: false,
        decls: vec![VarDeclarator {
            definite: false,
            span: DUMMY_SP,
            name: Pat::Ident(BindingIdent {
                type_ann: None,
                id: ident(name),
            }),
            init: Some(Box::new(expr)),
        }],
    }))
}
pub fn call_expr(name: &str, arg: Expr) -> Expr {
    Expr::Call(CallExpr {
        span: DUMMY_SP,
        type_args: None,
        args: vec![ExprOrSpread {
            spread: None,
            expr: Box::new(arg),
        }],
        callee: Callee::Expr(Box::new(Expr::Ident(ident(name)))),
    })
}
