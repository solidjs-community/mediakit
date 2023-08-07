import { defineConfig } from 'astro/config'

// https://astro.build/config
import solidJs from '@astrojs/solid-js'

// https://astro.build/config
import mdx from '@astrojs/mdx'

// https://astro.build/config
import netlify from '@astrojs/netlify/functions'

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), mdx()],
  site: `https://astro.build`,
  output: 'static',
  adapter: netlify(),
})
