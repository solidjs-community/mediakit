import { useAuth } from '@solid-mediakit/auth/client'
import { useParams } from '@solidjs/router'
import { createEffect, on, VoidComponent } from 'solid-js'

const AuthProvider: VoidComponent = () => {
  const params = useParams()
  const auth = useAuth()
  createEffect(
    on(auth.status, (status) => {
      if (status === 'authenticated') {
        window.close()
      } else if (status === 'unauthenticated') {
        void auth.signIn(params.provider)
      }
    }),
  )

  return (
    <div class='h-full w-full flex items-center justify-center flex-col gap-4'>
      <div class='text-white text-2xl font-bold animate-pulse'>
        Redirecting...
      </div>
      <p class='text-offwhite text-lg font-medium'>
        Please Wait While HackChat Is Validating Your Request
      </p>
    </div>
  )
}

export default AuthProvider
