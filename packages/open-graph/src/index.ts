import { ImageResponse } from '@vercel/og'
import HTMLParser from 'html-to-json-parser'
import type { JSONContent } from 'html-to-json-parser/dist/types'
import type { JSX } from 'solid-js'
function convertStyles(styleString?: string) {
  if (!styleString) return
  const obj: any = {}
  styleString.split(';').forEach((e) => {
    const [key, value] = e.split(':')
    obj[key] = value
  })
  return obj
}
function convertHTML(json: JSONContent | string): any {
  if (typeof json === 'string') {
    return json
  }
  return {
    type: json.type,
    props: {
      children:
        json.content.length === 1
          ? convertHTML(json.content[0])
          : json.content.map((c) => convertHTML(c)),
      ...json.attributes,
      style:
        json.attributes && 'style' in json.attributes
          ? convertStyles(json.attributes?.style as string)
          : undefined,
    },
  }
}
export async function createOpenGraphImage(jsx?: string | JSX.Element) {
  // TODO: Fix this hack
  let jsx1 = jsx as any
  if (typeof jsx1 !== 'string') {
    jsx1 = jsx1.t as string
  }
  const parsed = await HTMLParser(jsx1)
  const converted = convertHTML(parsed as JSONContent)
  return new ImageResponse(converted)
}

export async function createBase64Image(jsx?: string | JSX.Element) {
  const img = (await createOpenGraphImage(jsx)) as any
  const buf = await new Response(img.body).arrayBuffer()
  const url = 'data:image/png;base64,' + Buffer.from(buf).toString('base64')
  return url
}
