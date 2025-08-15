/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from '@vercel/og'
import type { ImageResponseNodeOptions } from '@vercel/og/dist/types'
import { html } from 'satori-html'
import type { JSX } from 'solid-js'
export const parseSolidJSX = async (jsx?:
	| string
	| JSX.Element
	| (() => (string | JSX.Element) | Promise<string | JSX.Element>)
	| { t: string }): Promise<ReturnType<typeof html> | undefined> => {
	if (!jsx) return
	if (typeof jsx === 'function') {
		jsx = await jsx()
	}
	if (jsx && typeof jsx === 'object' && Object.hasOwn(jsx, 't')) {
		jsx = (jsx as any).t.replace(/data-hk=\S+?((?=>)|\s)/, "") as string
	}
	if (typeof jsx !== 'string') {
		return
	}
	const converted = html(jsx)
	return converted
}
/**
 * Given, JSX, or a function that returns JSX, returns an image response.
 * Note: This can only be used on the server
 */
export async function createOpenGraphImage(
	jsx?:
		| string
		| JSX.Element
		| (() => (string | JSX.Element) | Promise<string | JSX.Element>)
		| { t: string },
	opts?: ImageResponseNodeOptions,
) {
	const converted = await parseSolidJSX(jsx)
	const img = new ImageResponse(converted as any, {
		...(opts ?? {}),
		headers: { 'X-Content-Raw': '' },
	})
	return img
}

export async function createBase64Image(jsx?: string | JSX.Element) {
	const img = (await createOpenGraphImage(jsx)) as { body: ReadableStream }
	const buf = await new Response(img.body).arrayBuffer()
	const url = 'data:image/png;base64,' + Buffer.from(buf).toString('base64')
	return url
}
//

/**
 * Parses the function arguments from the given URL
 * @param url
 * @returns
 */
export const getArguments = (url: string) => {
	const argsStr = new URL(url).searchParams.get('args')
	if (!argsStr) return []
	const args = JSON.parse(argsStr)
	return args
}
