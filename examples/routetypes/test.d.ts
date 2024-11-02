type $KnownRoutes = '/' | '/test'
type $KnownOrExt = $KnownRoutes | `http://${string}` | `https://${string}`

type $NavigateOptions = Partial<any> & {}

interface Navigator {
  <R extends $KnownRoutes>(to: R, options: $NavigateOptions): void
  (delta: number): void
}
