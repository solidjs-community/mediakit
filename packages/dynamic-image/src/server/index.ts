/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from '@vercel/og'
import { html } from 'satori-html'
import type { JSX } from 'solid-js'

export async function createOpenGraphImage(
  jsx?:
    | string
    | JSX.Element
    | (() => (string | JSX.Element) | Promise<string | JSX.Element>)
    | { t: string }
) {
  if (!jsx) return
  if (typeof jsx === 'function') {
    jsx = await jsx()
  }
  if (jsx && typeof jsx === 'object' && Object.hasOwn(jsx, 't')) {
    jsx = (jsx as any).t as string
  }
  if (typeof jsx !== 'string') {
    return
  }
  const converted = html(jsx)
  return new ImageResponse(converted as any)
}

export async function createBase64Image(jsx?: string | JSX.Element) {
  const img = (await createOpenGraphImage(jsx)) as any
  const buf = await new Response(img.body).arrayBuffer()
  const url = 'data:image/png;base64,' + Buffer.from(buf).toString('base64')
  return url
}
