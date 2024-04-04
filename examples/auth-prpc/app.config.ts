import { defineConfig } from "@solidjs/start/config";
import { prpcVite } from "@solid-mediakit/prpc-plugin";

export default defineConfig({
  ssr: true,
  vite: {
    ssr: {
      external: ["@prisma/client"],
    },
    plugins: [prpcVite({ log: true })],
  },
});
