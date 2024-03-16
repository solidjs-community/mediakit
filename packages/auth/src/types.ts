import type { AuthConfig } from '@auth/core'
import type { BuiltInProviderType } from '@auth/core/providers'
import type { Session } from '@auth/core/types'

export interface SolidAuthConfig extends Omit<AuthConfig, 'raw'> {}

export interface AuthClientConfig {
  baseUrl: string
  basePath: string
  baseUrlServer: string
  basePathServer: string
  _session?: Session | null | undefined
  _lastSync: number
  _getSession: (...args: any[]) => any
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace App {
    interface Locals {
      auth(): Promise<Session | null>
      /** @deprecated Use `auth` instead. */
      getSession(): Promise<Session | null>
      signIn: <
        P extends BuiltInProviderType | (string & NonNullable<unknown>),
        R extends boolean = true
      >(
        /** Provider to sign in to */
        provider?: P, // See: https://github.com/microsoft/TypeScript/issues/29729
        options?:
          | FormData
          | ({
              /** The URL to redirect to after signing in. By default, the user is redirected to the current page. */
              redirectTo?: string
              /** If set to `false`, the `signIn` method will return the URL to redirect to instead of redirecting automatically. */
              redirect?: R
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } & Record<string, any>),
        authorizationParams?:
          | string[][]
          | Record<string, string>
          | string
          | URLSearchParams
      ) => Promise<
        R extends false
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any
          : never
      >
      signOut: <R extends boolean = true>(options?: {
        /** The URL to redirect to after signing out. By default, the user is redirected to the current page. */
        redirectTo?: string
        /** If set to `false`, the `signOut` method will return the URL to redirect to instead of redirecting automatically. */
        redirect?: R
      }) => Promise<
        R extends false
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any
          : never
      >
    }
    interface PageData {
      session?: Session | null
    }
  }
}

export type LiteralUnion<T extends U, U = string> =
  | T
  | (U & Record<never, never>)

export interface SignInOptions extends Record<string, unknown> {
  /**
   * Specify to which URL the user will be redirected after signing in. Defaults to the page URL the sign-in is initiated from.
   *
   * [Documentation](https://next-auth.js.org/getting-started/client#specifying-a-callbackurl)
   */
  callbackUrl?: string
  /** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option) */
  redirect?: boolean
}

export interface SignOutParams<R extends boolean = true> {
  /** [Documentation](https://next-auth.js.org/getting-started/client#specifying-a-callbackurl-1) */
  redirectTo?: string
  /** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option-1 */
  redirect?: R
}

/** Match `inputType` of `new URLSearchParams(inputType)` */
export type SignInAuthorizationParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams
