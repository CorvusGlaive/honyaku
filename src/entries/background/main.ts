import ky, { type ResponsePromise, type Options } from "ky";
import { runtime, tabs } from "webextension-polyfill";
import { getActiveTab } from "~/lib/utils";
import { addHistory } from "~/lib/history";
import { db } from "~/lib/db";

const audio = globalThis.Audio && new Audio(); // For MV2 create HTMLAudioElement to play sounds from content scripts.
export interface ICacheDB {
	key: string;
	value: {
		url: string;
		result: unknown;
		time: number;
	};
	indexes: {
		url: string;
		time: number;
	};
}

async function playAudio(url: string) {
	if (audio) {
		audio.pause();
		audio.src = url;
		audio.play();
		return;
	}
	const currentTab = await getActiveTab();
	tabs.create({
		active: true,
		url:
			runtime.getURL("src/entries/options/index.html") +
			`?audio=${encodeURIComponent(url)}`,
		openerTabId: currentTab.id,
	});
}

const cacheInvalidationTime = 1000 * 60 * 60 * 24; // 24 hours
async function httpRequest(params: {
	url: string;
	options?: Options & { resMethod?: keyof ResponsePromise };
}) {
	const cacheDB = await db;
	const cachedResult = await cacheDB.get("cache", params.url);
	if (cachedResult && Date.now() - cachedResult.time < cacheInvalidationTime)
		return cachedResult.result;

	//@ts-ignore
	const result = await ky(params.url, params.options)[
		params.options?.resMethod || "json"
	]();
	cacheDB.put("cache", { url: params.url, result, time: Date.now() });
	return result;
}

const messageHanlders = {
	httpRequest,
	playAudio,
	addHistory,
};

runtime.onMessage.addListener(async ({ type, data }) => {
	console.log(
		`%cGot message: %c${type} -> `,
		"color: hotpink; font-size: 17.6px;",
		"color: violet; font-size: 16.32px;",
		data ?? "🤔"
	);

	return messageHanlders[type]?.(data);
});

runtime.onStartup.addListener(async () => {
	const cache = await db;
	cache.clear("cache").catch((e) => console.log("onStartup:clear:catch", e));
});
