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
const getRoutes = (base: string, paths: string[]) => {
	const routes = paths.map(p => p.replace(path.normalize(base), "").replaceAll("\\", "/").replace(".mdx", ""));
	return routes;
}
const routes = getRoutes("src/routes", await getPaths("src/routes")).filter(x => x !== "/index")
const processPackages = () => {
	const packageRoutes = routes.filter(r => r.startsWith("/packages/")).map(r => r.replace("/packages/", "").split("/"))

	let map: Record<string, string[]> = {};

	for (const route of packageRoutes) {
		const pkg = route[0];
		if (!route[1]) continue;
		if (!map[pkg]) {
			map[pkg] = [];
		}
		map[pkg].push(route[1])
	}

	return map;
}
const packageSidebarItem = (pkg: string, packages: Record<string, string[]>, collapsed: boolean, link?: (pkg: string, page: string) => string) => {
	const packageRoutes = packages[pkg];
	return {
		title: pkg,
		collapsed,
		items: packageRoutes.map(route => ({
			title: route,
			collapsed,
			link: link ? link(pkg, route) : `/${pkg}/${route}`,
			items: []
		}))
	}
}
const packages = processPackages();
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
					routes,
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
					"/packages": {
						items: [
							...(() => {
								return Object.keys(packages).map((key) => packageSidebarItem(key, packages, true))
							})()
							// {
							// 	title: "Overview",
							// 	collapsed: false,
							// 	items: [
							// 		{
							// 			title: "Getting Started",
							// 			link: "/packages",
							// 		},
							// 	],
							// },
						],
					},
					...(() => {
						let map = {};
						for (const pkg of Object.keys(packages)) {
							// @ts-ignore
							map[`/packages/${pkg}`] = {
								items: [packageSidebarItem(pkg, packages, false, (_, page) => `/${page}`)]
							}
						}
						return map;
					})()
					// "/packages/og": {
					// 	items: [packageSidebarItem("og", packages, false, (_, page) => `/${page}`)]
					// }
				},
			},
		},
	),
);