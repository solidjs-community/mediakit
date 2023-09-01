use std::path::PathBuf;

use swc_core::{
    common::{chain, Mark},
    ecma::{
        parser::{EsConfig, Syntax},
        transforms::{base::resolver, testing::test_fixture},
        visit::as_folder,
    },
};
use swc_plugin_dynamic_image::TransformVisitor;
use testing::fixture;
fn jsx_syntax() -> Syntax {
    Syntax::Es(EsConfig {
        jsx: true,
        ..Default::default()
    })
}
#[fixture("tests/fixture/**/code.jsx")]
fn tranform_works(input: PathBuf) {
    let output = input.parent().unwrap().join("output.jsx");

    test_fixture(
        jsx_syntax(),
        &|_t| {
            chain!(
                resolver(Mark::new(), Mark::new(), false),
                as_folder(TransformVisitor::default())
            )
        },
        &input,
        &output,
        Default::default(),
    );
}
