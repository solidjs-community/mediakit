import * as fs from "node:fs";
import * as path from "node:path";
import { createWithSolidBase } from "@kobalte/solidbase/config";
import defaultTheme, {
} from "@kobalte/solidbase/default-theme";
import { defineConfig } from "@solidjs/start/config";
import { SidebarItem } from "@kobalte/solidbase/client";

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
					crawlLinks: true,
				},
			},
		},
		{
			title: "MediaKit",
			lang: "en",
			themeConfig: {
				socialLinks: {
					// @ts-ignore
					github: "https://github.com/solidjs-community/mediakit",
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