import { defineConfig } from "astro/config";

// https://astro.build/config
import solidJs from "@astrojs/solid-js";

// https://astro.build/config
import vercel from "@astrojs/vercel/static";

// https://astro.build/config
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), mdx()],
  site: `https://astro.build`,
  output: "static",
  adapter: vercel()
});