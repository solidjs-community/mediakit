import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "yaml";
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
type RouteMetadata = {
	title: string,
	description?: string,
	order?: number,
}
type Route = {
	slug: string,
	metadata: RouteMetadata,
}
const parseMetadata = (path: string): RouteMetadata => {
	const contents = fs.readFileSync(path).toString();
	const start = contents.indexOf("---");
	const end = contents.lastIndexOf("---");
	if (start == -1 || end == -1) return { title: path.split("\\")[-1] }
	const yaml = contents.substring(start + 3, end)
	const parsed = parse(yaml);
	parsed.title ??= path.split("\\")[-1];
	return parsed
}
const getRoutes = (base: string, paths: string[]): Route[] => {
	const routes = paths.map(p => ({ slug: p.replace(path.normalize(base), "").replaceAll("\\", "/").replace(".mdx", ""), metadata: parseMetadata(p) }));
	return routes;
}
const routes = getRoutes("src/routes", await getPaths("src/routes")).filter(x => x.slug !== "/index")
const parentPackage = (route: Route) =>
	route.slug.replace("/packages/", "").split("/")[0]

const processPackages = () => {
	const packageRoutes = routes.filter(r => r.slug.startsWith("/packages/"));

	let map: Record<string, Route[]> = {};

	for (const route of packageRoutes) {
		const pkg = parentPackage(route)
		if (pkg === "index") continue;
		if (!map[pkg]) {
			map[pkg] = [];
		}
		map[pkg].push(route)
	}
	console.log(map)
	return map;
}


const packageSidebarItem = (pkg: string, packages: Record<string, Route[]>, link: (route: Route) => string, collapsed: boolean = false) => {
	const packageRoutes = packages[pkg];
	return {
		title: pkg,
		collapsed,
		items: packageRoutes.map(route => ({
			title: route.metadata.title,
			collapsed,
			link: link(route),
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
					routes: routes.map(r => r.slug),
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
						text: "Packages",
						link: "/packages",
					},
				],
				sidebar: {
					"/packages": {
						items: [
							...(() => {
								return Object.keys(packages).map((pkg) => packageSidebarItem(pkg, packages, (r) => r.slug.replace("/packages", "")))
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
								items: [packageSidebarItem(pkg, packages, (r) => r.slug.replace(`/packages/${pkg}`, ""))]
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