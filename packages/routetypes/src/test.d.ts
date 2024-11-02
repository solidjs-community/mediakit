type $KnownRoutes = '/' | '/test'

declare module '@solidjs/router' {
  interface Navigator {
    <R extends $KnownRoutes>(to: R, options?: Partial<NavigateOptions>): void
    (delta: number): void
  }
}
