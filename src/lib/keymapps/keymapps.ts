import { merge, set } from "lodash-es";
import { derived } from "svelte/store";
import { store } from "~/store";

export type KeymapStore = [defaultKey: string, changedKey?: string];
export type KeymapsStore = {
	[group: string]: {
		[id: string]: KeymapStore;
	};
};
type KeyHandler = (event: KeyboardEvent) => void;
type Keymaps = Record<string, [id: string, handler: KeyHandler] | KeyHandler>;
type Options = {
	group?: string;
	condition?: () => boolean;
};

let savedKeys: KeymapsStore = {};
let keysBatchUpdate: KeymapsStore = {};

export function registerKeymaps(
	mappings: Keymaps | (() => Keymaps),
	{ group = "other", condition }: Options
) {
	mappings = typeof mappings === "function" ? mappings() : mappings;
	if (!mappings) throw Error("Provide key mappings!");

	log({ group, condition, mappings });
	savedKeys = store.keymaps.get();

	return getHandler(parseMappings(mappings, group), condition);
}

export const keymaps = derived(store.keymaps, ($keys) => {
	savedKeys = $keys;
	return Object.entries($keys).map(([group, actions]) => [
		group,
		Object.entries(actions),
	]) as [group: string, actions: [id: string, keys: [string, string]][]][];
});

const isAlpha = (char: string) => char >= "A" && char <= "z";
function parseMappings(
	maps: Keymaps,
	group: string
): Record<string, KeyHandler> {
	const keyMaps = {};

	for (let [keys, id] of Object.entries(maps)) {
		if (Array.isArray(id)) {
			keys = getKey(keys, id[0], group);
			id = id[1];
		}
		const _keys = keys.split("-");
		let key = _keys.pop();
		let mod = _keys.sort().join("") || "n";

		if (key.length === 1) {
			key = `${isAlpha(key) ? "Key" : "Digit"}${key.toUpperCase()}`;
		}

		set(keyMaps, [mod, key], id);
	}

	log("parseMappings:keyMaps:", keyMaps);

	if (Object.keys(keysBatchUpdate).length) saveKeys();

	return keyMaps;
}

function getKey(key: string, id: string, group: string = "other"): string {
	const savedKey = savedKeys?.[group]?.[id] || keysBatchUpdate?.[group]?.[id];

	log("getKey", {
		key,
		id,
		group,
		savedKey,
		savedKeys,
		keysButchUpdate: keysBatchUpdate,
	});

	if (!savedKey) {
		set(keysBatchUpdate, [group, id], [key]);
	} else {
		log("getKey->found saved key", { group, id, key, savedKey }, savedKeys);
	}

	return savedKey?.[1] || key;
}

export function setKey(key: string, id: string, group: string) {
	_setKey(key, id, group);
}

export function resetKey(id: string, group: string) {
	_setKey(null, id, group);
}

function _setKey(key: string | null, id: string, group: string) {
	log("_setKey", {
		savedKeys,
		keysButchUpdate: keysBatchUpdate,
		group,
		id,
		key,
	});
	if (!savedKeys?.[group]?.[id])
		return log("_setKey", "there's no such a key in the store!");

	store.keymaps.update((s) => {
		set(s, [group, id, 1], key);
		return s;
	});
}

function saveKeys() {
	store.keymaps.update((s) => merge(s, keysBatchUpdate));
}

function getHandler(
	keys: Record<string, KeyHandler>,
	condition: () => boolean
): KeyHandler {
	return (e: KeyboardEvent) => {
		if (["Control", "Shift", "Alt"].includes(e.key)) return;
		if (condition && !condition()) return;

		const activeElement =
			document.activeElement?.shadowRoot?.activeElement ||
			document.activeElement;
		const isTargetInput = activeElement?.tagName !== "BODY";
		let mods = "";

		e.altKey && (mods += "a");
		e.ctrlKey && (mods += "c");
		isTargetInput && (mods += "i");
		e.shiftKey && (mods += "s");

		mods ||= "n";

		if (isTargetInput) {
			return keys?.[mods]?.[e.code]?.(e);
		}

		if (!keys?.[mods]?.[e.code]) return;

		// Global shortcuts
		if (
			e.composedPath()[0] === document.body &&
			e.eventPhase === Event.CAPTURING_PHASE &&
			e.isTrusted
		) {
			e.stopPropagation();
		}
		e.preventDefault();
		keys[mods][e.code](e);
	};
}

function log(...args: any): void {
	return;
	console.log(
		"%cregisterKeymaps:",
		"color: palevioletred; font-size: 16px; font-weight:bold;",
		...args
	);
}
