import { cloneDeep, isEqual } from "lodash-es";
import browser from "webextension-polyfill";
import type { Settings } from "~/services";
import type { KeymapsStore } from "~/lib/keymapps";

const currentStore = await browser.storage.local.get(null);

export function createStore<T>(name: string, initialValue: T) {
	browser.runtime
		.sendMessage({
			type: `Initiated store: ${name}`,
			data: document.URL,
		})
		.catch(() => {});

	let listeners = new Set<(value: T) => void>();
	let storeValue = currentStore[name];

	if (!storeValue) {
		storeValue = initialValue;
		browser.storage.local.set({ [name]: initialValue });
	}

	function applyChanges(changes: browser.Storage.StorageChange) {
		if (changes?.newValue == null) return;

		storeValue = cloneDeep(changes.newValue);

		listeners.forEach((l) => l(changes.newValue));
	}

	function subscribe(subscription: (value: T) => void) {
		subscription(cloneDeep(storeValue));
		listeners.add(subscription);

		function unsubscribe() {
			listeners.delete(subscription);
		}

		return unsubscribe;
	}

	function set(value: T): boolean {
		console.log(
			"%cSTORE::SET -> ",
			"color: mediumseagreen; font-size: 16px;",
			{ name, storeValue, value },
			storeValue == value
		);

		if (isEqual(storeValue, value)) return false;
		storeValue = cloneDeep(value);

		browser.storage.local
			.set({ [name]: value })
			.catch((e) => console.error("STORE::SET ->", e, storeValue, value));
	}

	function update(updateFn: (store: T) => T) {
		set(updateFn(cloneDeep(storeValue)));
	}

	function get(): T {
		return storeValue;
	}

	return { subscribe, set, get, update, applyChanges };
}

export const store = {
	translationApi: createStore<string>("translationApi", "google"),
	theme: createStore<"auto" | "dark" | "light">("theme", "auto"),
	accentColor: createStore("accentColor", "blue"),
	fontSize: createStore<"small" | "medium" | "large">("fontSize", "medium"),
	//@ts-ignore
	services: createStore<Record<string, Settings>>("services", {}),
	keymaps: createStore<KeymapsStore>("keymaps", {}),
};

export type StoreType<Store extends keyof typeof store> = ReturnType<
	(typeof store)[Store]["get"]
>;

browser.storage.onChanged.addListener((changes, area) => {
	console.log(changes);
	for (const [k, v] of Object.entries(changes)) {
		console.log(
			"%cSTORE::CHANGE ->",
			"color: mediumpurple; font-size: 16px;",
			k,
			v,
			new URL(document.URL).pathname
		);
		store[k]?.applyChanges(v, area);
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
