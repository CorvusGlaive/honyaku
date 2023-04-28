import pkg from "../package.json";

const sharedManifest = {
	default_locale: "en",
	commands: {
		_execute_browser_action: {
			suggested_key: {
				default: "Alt+Shift+X",
			},
		},
	},
	content_scripts: [
		{
			all_frames: true,
			match_about_blank: true,
			js: ["src/entries/contentScript/main.ts"],
			matches: ["<all_urls>"],
		},
	],
	icons: {
		16: "icons/cherry-16.png",
		32: "icons/cherry-32.png",
		48: "icons/cherry-48.png",
		96: "icons/cherry-96.png",
	},
	options_ui: {
		page: "src/entries/settings/index.html",
		open_in_tab: true,
	},
	permissions: ["storage", "clipboardWrite", "activeTab"],
	web_accessible_resources: ["icons/cherry.svg"],
};

// if (process.env.VITE_BROWSER === "firefox") {
sharedManifest["applications"] = {
	gecko: {
		id: "addon@example.com",
	},
};
// }

const browserAction = {
	default_icon: {
		16: "icons/cherry-16.png",
		32: "icons/cherry-32.png",
	},
	default_popup: "src/entries/popup/index.html",
};

export const ManifestV2 = {
	...sharedManifest,
	background: {
		scripts: ["src/entries/background/script.ts"],
	},
	browser_action: browserAction,
	options_ui: {
		...sharedManifest.options_ui,
		chrome_style: false,
	},
	permissions: [...sharedManifest.permissions, "<all_urls>"],
};

export const ManifestV3 = {
	...sharedManifest,
	action: browserAction,
	background: {
		service_worker: "src/entries/background/serviceWorker.ts",
	},
	host_permissions: ["<all_urls>"],
	permissions:
		sharedManifest.permissions as any as chrome.runtime.ManifestPermissions[],
	web_accessible_resources: sharedManifest.web_accessible_resources.map(
		(r) => ({ resources: [r], matches: ["*://*/*"] })
	),
};

export function getManifest(
	manifestVersion: number
): chrome.runtime.ManifestV2 | chrome.runtime.ManifestV3 {
	const manifest = {
		author: pkg.author,
		description: pkg.description,
		name: pkg.displayName ?? pkg.name,
		version: pkg.version,
	};

	if (manifestVersion === 2) {
		return {
			...manifest,
			...ManifestV2,
			manifest_version: manifestVersion,
		};
	}

	if (manifestVersion === 3) {
		return {
			...manifest,
			...ManifestV3,
			manifest_version: manifestVersion,
		};
	}

	throw new Error(
		`Missing manifest definition for manifestVersion ${manifestVersion}`
	);
}
