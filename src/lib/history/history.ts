import { runtime } from "webextension-polyfill";
import { db } from "../db";
import { getActiveTab, isContentScript } from "../utils";

/**
 * A history entry.
 * @param {string} key - A key (i.e "`service:query`"). If service handles multiple languages it's recommended to add those languages to the key like "`service:query:srcLang:targetLang`".
 */
export interface HistoryEntry {
	keys: string;
	service: string;
	query: string;
	result: any;
	time?: number;
	sources?: Record<string, [string, number, boolean]>;
}

export interface IHistoryDB {
	key: number;
	value: HistoryEntry;
	indexes: Omit<HistoryEntry, "result" | "sources">;
}

export async function addHistory(entry: HistoryEntry) {
	if (isContentScript())
		return runtime.sendMessage({ type: "addHistory", data: entry });

	const [url, ...restInfo] = await getTabInfo();
	entry.time ??= Date.now();
	entry.sources ??= {};
	entry.sources[url] = restInfo;

	const _db = await db;
	const dbEntryCursor = await _db
		.transaction("history", "readwrite")
		.store.index("keys")
		.openCursor(entry.keys);

	if (dbEntryCursor) {
		entry.sources = { ...dbEntryCursor.value.sources, ...entry.sources };
		dbEntryCursor.update(entry);
		return;
	}

	_db.add("history", entry);
}

export async function getHistory(
	service?: string,
	limit = 10
): Promise<HistoryEntry[]> {
	const hy = await db;
	const dbIndex = hy
		.transaction("history", "readonly")
		.store.index(service ? "service" : "time");
	let cursor = await dbIndex.openCursor(service || null, "prev");
	let result = [];

	if (!cursor) return [];

	for (let i = 0; cursor && i < limit; cursor = await cursor.continue(), i++) {
		result.push(cursor.value);
	}

	return result;
}

export async function getAllHistory() {
	const _db = await db;
	return _db.getAllFromIndex("history", "time");
}

export async function deleteHistory(key?: string) {
	const _db = await db;

	if (!key) {
		return _db.clear("history");
	}

	try {
		const cursor = await _db
			.transaction("history", "readwrite")
			.store.index("keys")
			.openCursor(key);
		cursor?.delete();
	} catch (e) {
		console.error("history:deleteHistory", e);
	}
}

async function getTabInfo(): Promise<
	[url: string, title: string, timestamp: number, isPopup: boolean]
> {
	const url = document.URL;
	const extUrl = runtime.getURL("");

	if (!url.startsWith(extUrl))
		return [document.URL, document.title, Date.now(), false];

	let isPopup = url.endsWith("popup/index.html");
	let tab = await getActiveTab();
	tab.url ??= "internal";
	tab.title ??= "internal";

	return [tab.url, tab.title, Date.now(), isPopup];
}
