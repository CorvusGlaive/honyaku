import { store } from "~/store.svelte";

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

export function registerKeymaps(
	mappings: Keymaps | (() => Keymaps),
	{ group = "other", condition }: Options,
) {
	mappings = typeof mappings === "function" ? mappings() : mappings;
	if (!mappings) throw Error("Provide key mappings!");

	return getHandler(parseMappings(mappings, group), condition);
}

export const keymaps = {
	get val() {
		return Object.entries(store.keymaps.val).map(([group, actions]) => [
			group,
			Object.entries(actions),
		]) as [group: string, actions: [id: string, keys: [string, string]][]][];
	},
};

const isAlpha = (char: string) => char >= "A" && char <= "z";

function parseMappings(
	maps: Keymaps,
	group: string,
): Record<string, Record<string, KeyHandler>> {
	const keyMaps = {};

	for (let [keys, id] of Object.entries(maps)) {
		if (Array.isArray(id)) {
			keys = getKey(keys, id[0], group);
			id = id[1];
		}
		const _keys = keys.split("-");
		let key = _keys.pop()!;
		let mod = _keys.sort().join("") || "n";

		if (key.length === 1) {
			key = `${isAlpha(key) ? "Key" : "Digit"}${key.toUpperCase()}`;
		}

		objectSet(keyMaps, [mod, key], id);
	}

	return keyMaps;
}

function getKey(key: string, id: string, group: string = "other"): string {
	const savedKey = store.keymaps.val?.[group]?.[id];

	if (!savedKey) {
		objectSet(store.keymaps.val, [group, id], [key]);
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
	if (!store.keymaps.val?.[group]?.[id]) return;
	objectSet(store.keymaps.val, [group, id, 1], key);
}

function getHandler(
	keys: Record<string, Record<string, KeyHandler>>,
	condition?: () => boolean,
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

function objectSet(obj: object, path: (string | number)[], value: any) {
	let o = obj as any;
	path.forEach((key, i) => {
		let newVal = value;
		if (i !== path.length - 1) {
			if (!(key in o)) newVal = typeof path[i + 1] === "number" ? [] : {};
			else newVal = o[key];
		}
		o[key] = newVal;
		o = o[key];
	});
}
