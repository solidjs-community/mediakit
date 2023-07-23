import { createSignal } from 'solid-js'

export const HelloComponent = () => {
  return <div>hey</div>
}

export const Toggler = () => {
  const [toggled, setToggled] = createSignal(false)
  return (
    <div>
      <button onClick={() => setToggled(!toggled())}>Toggle</button>
      {toggled() ? <div>hey</div> : null}
    </div>
  )
}

import type { IncomingMessage } from 'http'
import { parseRequest } from './utils/parser'
import { getScreenshot } from './utils/chromium'
import { getHtml } from './utils/template'

const isDev = !process.env.AWS_REGION
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1'

export default async function handler(req: IncomingMessage) {
  try {
    const parsedReq = parseRequest(req)
    const html = getHtml(parsedReq)
    if (isHtmlDebug) {
      // res.setHeader('Content-Type', 'text/html')
      // res.end(html)
      return new Response(html, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      })
    }
    const { fileType } = parsedReq
    const file = await getScreenshot(html, fileType, isDev)
    // res.statusCode = 200
    // res.setHeader('Content-Type', `image/${fileType}`)
    // res.setHeader(
    //   'Cache-Control',
    //   `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
    // )
    // res.end(file)
    return new Response(file, {
      headers: {
        'content-type': `image/${fileType}`,
        'Cache-Control': `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
      },
    })
  } catch (e) {
    // res.statusCode = 500
    // res.setHeader('Content-Type', 'text/html')
    // res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>')
    return new Response(
      '<h1>Internal Error</h1><p>Sorry, there was a problem</p>',
      {
        headers: {
          'content-type': 'text/html',
        },
      }
    )

    console.error(e)
  }
}
