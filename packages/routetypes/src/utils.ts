import * as babel from '@babel/core'

export const getRoutes = async (config?: {
  router: {
    internals?: {
      routes?: {
        getRoutes: () => Promise<
          {
            page: boolean
            $component: {
              src: string
              pick: any[]
            }
            $$route: undefined
            path: string
            filePath: string
          }[]
        >
      }
    }
  }
}) => {
  const router = config?.router?.internals?.routes
  return (await router?.getRoutes?.bind(router)?.()) ?? []
}

export const getRoot = (router: { root: string }) => {
  return router.root
}

export const tsTemplate = (code: string) => {
  return babel.template({ plugins: ['typescript'] })(code)()
}
