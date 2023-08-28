import { writeFile } from "fs/promises";
const packageJson = `{
	"name": "swc-plugin-dynamic-image",
  	"version": "0.1.0",
  	"files": [
    	"swc_plugin_dynamic_image_bg.wasm",
    	"swc_plugin_dynamic_image.js",
    	"swc_plugin_dynamic_image.d.ts"
  	],
  	"module": "swc_plugin_dynamic_image.js",
  	"types": "swc_plugin_dynamic_image.d.ts",
  	"sideEffects": [
    	"./snippets/*"
  	],
	"type": "module",
	"exports": {
		".": {
			"import": "./swc_plugin_dynamic_image.js",
			"types": "./swc_plugin_dynamic_image.d.ts"
		}
	}
}
`;
(async () => {
	await writeFile("./pkg/package.json", packageJson);
})();
