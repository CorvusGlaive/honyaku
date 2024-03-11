import browser from "webextension-polyfill";
import type { Settings } from "~/services";
import type { KeymapsStore } from "~/lib/keymapps";
import { unstate } from "svelte";

const currentStore = await browser.storage.local.get(null);

export function createStore<T>(name: string, initialValue: T) {
	let storeValue = $state<T>(currentStore[name] || initialValue);
	let isLocalChange: boolean = !!currentStore[name];

	let destroy = $effect.root(() => {
		$effect(() => {
			const v = unstate(storeValue);
			console.log(
				`%c$store:${name}`,
				`font-weight:bold;color:${!isLocalChange ? "mediumseagreen" : "orange"}`,
				v,
				isLocalChange,
			);
			if (isLocalChange) {
				isLocalChange = false;
				return;
			}
			isLocalChange = true;
			console.log(
				`%cset:${name}`,
				"color:blue;font-weight:bold;",
				isLocalChange,
			);
			browser.storage.local.set({ [name]: v }).then(() => {
				setTimeout(() => {
					console.log(
						`%cset:${name}:then`,
						"color:navy;font-weight:bold;",
						isLocalChange,
					);
					isLocalChange = false;
				}, 10);
			});
		});
	});

	function applyChanges(changes: browser.Storage.StorageChange) {
		console.log(
			"%capplyChanges:",
			`font-weight:bold;color:${isLocalChange ? "mediumseagreen" : "orange"}`,
			storeValue,
			changes.newValue,
			isLocalChange,
		);
		if (isLocalChange) return (isLocalChange = false);
		if (changes?.newValue == null) return;

		isLocalChange = true;
		storeValue = changes.newValue;
	}

	return {
		set val(value: T) {
			storeValue = value;
		},
		get val() {
			return storeValue;
		},
		destroy,
		applyChanges,
	};
}

export const store = {
	translationApi: createStore<string>("translationApi", "google"),
	theme: createStore<"auto" | "dark" | "light">("theme", "auto"),
	accentColor: createStore("accentColor", "blue"),
	fontSize: createStore<"small" | "medium" | "large">("fontSize", "medium"),
	services: createStore<Record<string, Settings>>("services", {}),
	keymaps: createStore<KeymapsStore>("keymaps", {}),
};

export type StoreType<Store extends keyof typeof store> =
	(typeof store)[Store]["val"];

browser.storage.onChanged.addListener((changes) => {
	for (const [k, v] of Object.entries(changes)) {
		console.log(
			"%cSTORE::CHANGE ->",
			"color: mediumpurple; font-size: 16px;",
			k,
			v,
			v.oldValue === v.newValue,
			new URL(document.URL).pathname,
		);
		if (v.oldValue === v.newValue) return;
		store[k as keyof typeof store]?.applyChanges(v);
	}
});

declare global {
	interface Window {
		_STORE: typeof store;
	}
}
// if (import.meta.env.DEV) {
window._STORE = store;
// }
