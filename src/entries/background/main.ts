import { runtime, tabs } from "webextension-polyfill";
import { getActiveTab, httpRequest } from "~/lib/utils";
import { addHistory } from "~/lib/history/history";
import srv from "~/services";
srv; // used for services' store setup
const audio = globalThis.Audio && new Audio(); // For MV2 create HTMLAudioElement to play sounds from content scripts.

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

const messageHanlders: Record<string, (...args: any[]) => Promise<any>> = {
	playAudio,
	httpRequest,
	addHistory,
};

runtime.onMessage.addListener(async ({ type, data }) => {
	return messageHanlders[type]?.(...data);
});
