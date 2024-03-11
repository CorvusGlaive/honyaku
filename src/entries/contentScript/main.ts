import browser from "webextension-polyfill";
import { mount } from "svelte";
import App from "./Content.svelte";

async function render(cssPaths: string[]) {
	const shadowHost = document.createElement("div");
	shadowHost.id = "honyaku";
	const shadowRoot = shadowHost.attachShadow({
		mode: "open",
	});
	const appContainer = document.createElement("main");

	if (import.meta.hot) {
		const { addViteStyleTarget } = await import(
			"@samrum/vite-plugin-web-extension/client"
		);

		await addViteStyleTarget(shadowRoot);
	} else {
		for (const cssPath of cssPaths) {
			const styleEl = document.createElement("link");
			styleEl.className = "darkreader";
			styleEl.setAttribute("rel", "stylesheet");
			styleEl.setAttribute("href", browser.runtime.getURL(cssPath));
			shadowRoot.appendChild(styleEl);
		}
	}

	document.body.appendChild(shadowHost);
	shadowRoot.appendChild(appContainer);

	mount(App, { target: appContainer });
}

render(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS);

browser.runtime.onMessage.addListener(async ({ type }) => {
	switch (type) {
		case "getSelectedText":
			return window.getSelection()?.toString().trim() || "";
		default:
			break;
	}
});
