import { getProperty } from "dot-prop";
export const prerenderDynamicImage = async (DynamicImageFunction: (...args: any) => Promise<{ body: ReadableStream }>, args: any[], out_path: string) => {
	console.log("Prerendering dynamic images")
	const { createWriteStream } = await import("node" + ":fs");
	const { resolvePreset } = await import("nitropack" + "/presets");
	const data = await DynamicImageFunction(args);

	// const path = "." + import.meta.env.BASE_URL + "/DynamicImage1.png";
	// @ts-ignore
	const path = (await resolvePreset("vercel-static", {}))
	// const baseURL = import.meta.baseURL;
	const dir = _compilePathTemplate(path!.output.dir)({ rootDir: "." })
	const publicDir = _compilePathTemplate(path!.output.publicDir)({ output: { dir }, baseURL: out_path })
	// console.log("Path:", path, import.meta.baseURL, import.meta.env.BASE_URL)
	const fsStream = createWriteStream(publicDir)
	writeReadableStreamToWritable(data.body!, fsStream)
}

// Implementation taken from https://github.com/remix-run/remix/blob/main/packages/remix-node/stream.ts#L4-L29
async function writeReadableStreamToWritable(
	stream: ReadableStream,
	// @ts-ignore
	writable: Writable
) {
	let reader = stream.getReader();
	let flushable = writable as { flush?: Function };

	try {
		while (true) {
			let { done, value } = await reader.read();

			if (done) {
				writable.end();
				break;
			}

			writable.write(value);
			if (typeof flushable.flush === "function") {
				flushable.flush();
			}
		}
	} catch (error: unknown) {
		writable.destroy(error as Error);
		throw error;
	}
}
// Implementation from https://github.com/nitrojs/nitro/blob/ac4361e160efd84d572a88234a8ddec4de76cd1e/src/kit/path.ts#L32C3-L32C4
function _compilePathTemplate(contents: string) {
	return (params: Record<string, any>) =>
		contents.replace(/{{ ?([\w.]+) ?}}/g, (_, match) => {
			const val = getProperty<Record<string, string>, string>(params, match);
			if (!val) {
				console.warn(
					`cannot resolve template param '${match}' in ${contents.slice(0, 20)}`
				);
			}
			return val || `${match}`;
		});
}