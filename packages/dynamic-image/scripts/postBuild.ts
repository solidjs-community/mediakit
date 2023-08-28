import { copyFile } from 'fs/promises'

copyFile('./src/swc-plugin-dynamic-image/pkg/swc_plugin_dynamic_image_bg.wasm', './dist/swc_plugin_dynamic_image_bg.wasm')
