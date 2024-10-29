import { GET } from '@solidjs/start'
import { createCaller, callMiddleware$ } from '@solid-mediakit/authpc'
import { getRequestEvent } from 'solid-js/web'
import { importCaller, _$$importCaller_mws } from './withImport'
import { myCaller, _$$myCaller_mws } from './withMw'
export const wrappedImport = importCaller
export const wrappedQuery = createCaller(
  GET(async (_$$payload) => {
    'use server'
    const _$$event = getRequestEvent()
    const ctx$ = await callMiddleware$(_$$event, _$$wrappedImport_mws)
    if (ctx$ instanceof Response) return ctx$
    return {
      ttt: 1,
    }
  }),
  {
    protected: false,
    key: 'wrappedQuery',
    method: 'GET',
    type: 'query',
  },
)
export const testCaller = myCaller
export const testQuery = createCaller(
  GET(async (_$$payload) => {
    'use server'
    const _$$event = getRequestEvent()
    const ctx$ = await callMiddleware$(_$$event, _$$testCaller_mws)
    if (ctx$ instanceof Response) return ctx$
    return {
      lll: 1,
    }
  }),
  {
    protected: false,
    key: 'testQuery',
    method: 'GET',
    type: 'query',
  },
)
export const _$$wrappedImport_mws = [
  ..._$$importCaller_mws,
  ({ ctx$ }) => {
    return {
      ...ctx$,
      lmao: 1,
    }
  },
]
export const _$$testCaller_mws = [
  ..._$$myCaller_mws,
  () => {
    return {
      delete: true,
    }
  },
]
