import * as fs from "node:fs";
import * as path from "node:path";
import { createWithSolidBase } from "@kobalte/solidbase/config";
import defaultTheme, {
} from "@kobalte/solidbase/default-theme";
import { defineConfig } from "@solidjs/start/config";
import { readdir } from "node:fs/promises";
const getPaths = async (base: string): Promise<string[]> => {
	const files = await readdir(base, { withFileTypes: true });
	const paths = [];
	for (const file of files) {
		if (file.isDirectory()) {
			paths.push(...((await getPaths(path.join(base, file.name)))));
		}
		else {
			paths.push(path.join(base, file.name))
		}
	}
	return paths;
}
const getRoutes = async (base: string) => {
	const paths = await getPaths(base);
	const routes = paths.map(p => p.replace(path.normalize(base), "").replaceAll("\\", "/").replace(".mdx", ""));
	return routes;
}

export default defineConfig(
	createWithSolidBase(defaultTheme)(
		{
			ssr: true,
			server: {
				compatibilityDate: "2025-05-28",
				preset: "vercel-static",
				vercel: {

				},
				prerender: {
					routes: await getRoutes("src/routes"),
					crawlLinks: true,
				},
			},
		},
		{
			title: "MediaKit",
			lang: "en",
			themeConfig: {
				socialLinks: {
					github: { link: "https://github.com/solidjs-community/mediakit" },
				},
				nav: [
					{
						text: "Guide",
						link: "/guide",
					},
					{
						text: "API",
						link: "/api",
					},
				],
				sidebar: {
					"/guide": {
						items: [
							{
								title: "Overview",
								collapsed: false,
								items: [
									{
										title: "Getting Started",
										link: "/",
									},
								],
							},
						],
					},
				},
			},
		},
	),
);