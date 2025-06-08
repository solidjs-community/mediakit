import { NitroApp } from "nitropack"
import { error } from "node:console"
import { createWriteStream } from "node:fs"
import { Writable } from "node:stream";

// Implementation taken from https://github.com/remix-run/remix/blob/main/packages/remix-node/stream.ts#L4-L29
export async function writeReadableStreamToWritable(
  stream: ReadableStream,
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
export default function defineNitroPlugin(nitroApp: NitroApp) {
	console.log('Nitro plugin running')
	nitroApp.hooks.hook("request", async (r) => {
		// console.log(r);
		if (r.node.req.url?.includes("_server")) {
			const url = r.node.req.url;
			if (r.node.req.headers.internal) return;
			console.log("Here")
			const data = await fetch(`http://localhost:4000${url}`, {
				headers: {
					internal: "true",
				}
			});
			const fsStream = createWriteStream("./hello.png")
			
			writeReadableStreamToWritable(data.body!, fsStream)
			// console.log("Server function call!")
			// const fsStream = createWriteStream("./hello.png")
			// r.node.res.pipe(fsStream);
			// // r.node.res.pipe(fsStream);
			// console.log("RES:", r.node.res);
			// r.node.res.end();
		}
	})
}