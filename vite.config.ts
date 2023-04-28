import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest";

const isFirefox =
	process.env.VITE_BROWSER && process.env.VITE_BROWSER === "firefox";

const resolve = (dir: string) => path.resolve(__dirname, dir);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const isDev = mode === "development";

	console.log("MODE:", mode);

	const manifestVersion = Number(env.MANIFEST_VERSION);

	return {
		build: {
			target: "esnext",
			/* outDir: isDev
				? resolve("./dist")
				: isFirefox
				? resolve("./dist/firefox")
				: resolve("./dist/chrome"), */
		},
		plugins: [
			svelte(),
			webExtension({
				manifest: getManifest(manifestVersion),
			}),
		],
		resolve: {
			alias: {
				"~": resolve("./src"),
			},
		},
	};
});
