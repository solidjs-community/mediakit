import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import auth from '@solid-mediakit/auth/unplugin'

export default defineConfig(() => {
  return {
    plugins: [
      auth.vite({
        protected: ['protected'],
        log: false,
        login: '/',
      }),
      solid({ ssr: true }),
    ],
  }
})
