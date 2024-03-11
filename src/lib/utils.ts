import browser, { i18n } from "webextension-polyfill";

export function isContentScript() {
	return !document.URL.startsWith(browser.runtime.getURL(""));
}

const audio = isContentScript() ? undefined : new Audio();
/** Google's Text To Speech service
 */
export async function ttsPlay(text: string, lang: string = "en") {
	const url = `https://translate.google.com/translate_tts?client=tw-ob&tl=${lang}&q=${encodeURIComponent(
		text
	)}`;
	if (!audio) {
		return sendMessageRuntime("playAudio", url);
	}

	audio.pause();
	audio.src = url;
	audio.play();
}

export async function httpRequest(
	url: string,
	options?: RequestInit & { bodyMethod?: "json" | "text" },
) {
	if (isContentScript()) return sendMessageRuntime("httpRequest", url, options);

	const resp = await fetch(url, options);
	const bodyMethod = options?.bodyMethod || "json";
	const result = await resp[bodyMethod]();

	return result;
}

export async function getActiveTab() {
	const tabs = await browser.tabs.query({ active: true, currentWindow: true });
	return tabs[0];
}

export function sendMessageRuntime(type: string, ...args: any): Promise<any> {
	return browser.runtime.sendMessage({ type, data: args });
}

export async function sendMessageTab(
	msg: { type: string; data?: any },
	tabId?: number
) {
	const activeTab = await getActiveTab();
	return browser.tabs.sendMessage(tabId ?? activeTab.id!, msg);
}

export function getRootElement(): HTMLElement {
	return isContentScript()
		? document.getElementById("honyaku")!.shadowRoot!.querySelector("main")!
		: document.documentElement;
}

export function getScrollContainer() {
	return (
		document.getElementById("honyaku")?.shadowRoot || document
	).querySelector("[data-scrollbar-content]");
}

export function t(msg: string, substitutions?: string | string[]) {
	return i18n.getMessage(msg, substitutions);
}
