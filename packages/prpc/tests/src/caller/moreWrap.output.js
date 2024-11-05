import { query } from '@solidjs/router'
import { createCaller, callMiddleware$ } from '@solid-mediakit/prpc'
import { getRequestEvent } from 'solid-js/web'
import { myCaller, _$$myCaller_mws } from './withMw'
import { wrappedImport, _$$wrappedImport_mws } from './wrapImport'
export const wrappedImport2 = wrappedImport
export const wrappedImport3 = wrappedImport2
export const wrappedQuery3 = createCaller(
  query(async (_$$payload) => {
    'use server'
    const _$$event = getRequestEvent()
    const ctx$ = await callMiddleware$(_$$event, _$$wrappedImport3_mws)
    if (ctx$ instanceof Response) return ctx$
    return {
      ttt: 1,
    }
  }),
  {
    protected: false,
    key: 'wrappedQuery3',
    method: 'GET',
    type: 'query',
  },
)
export const wrappedQuery2 = createCaller(
  query(async (_$$payload) => {
    'use server'
    const _$$event = getRequestEvent()
    const ctx$ = await callMiddleware$(_$$event, _$$wrappedImport2_mws)
    if (ctx$ instanceof Response) return ctx$
    return {
      ttt: 1,
    }
  }),
  {
    protected: false,
    key: 'wrappedQuery2',
    method: 'GET',
    type: 'query',
  },
)
export const testCaller = myCaller
export const testQuery = createCaller(
  query(async (_$$payload) => {
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
export const _$$wrappedImport2_mws = [
  ..._$$wrappedImport_mws,
  () => {
    return {
      lol: true,
    }
  },
]
export const _$$wrappedImport3_mws = [
  ..._$$wrappedImport2_mws,
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
