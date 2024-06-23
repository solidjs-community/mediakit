import { defineConfig } from "@solidjs/start/config";
import { vitePlugin as OGPlugin } from "@solid-mediakit/og/unplugin";
export default defineConfig({
    vite: {
        plugins: [OGPlugin()]
    }
});
