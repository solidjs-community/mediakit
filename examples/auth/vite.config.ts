import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import auth from '@solid-mediakit/auth/vite'

export default defineConfig(() => {
  return {
    plugins: [
      auth({
        protected: ['protected'],
      }),
      solid({ ssr: true }),
    ],
  }
})
