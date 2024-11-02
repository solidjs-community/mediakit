'use strict'

var web = require('solid-js/web')
var solidQuery = require('@tanstack/solid-query')

// src/provider.tsx
exports.PRPCProvider = (props) => {
  return web.createComponent(
    solidQuery.QueryClientProvider,
    web.mergeProps(
      {
        get client() {
          return props.queryClient
        },
      },
      () => props.queryProps,
      {
        get children() {
          return props.children
        },
      },
    ),
  )
}
