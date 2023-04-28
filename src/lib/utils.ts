import type { Options, ResponsePromise } from "ky";
import { writable } from "svelte/store";
import browser, { i18n } from "webextension-polyfill";

export const delay = (data: unknown, ms: number) =>
	new Promise((res) => setTimeout(() => res(data), ms));

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
		return browser.runtime.sendMessage({
			type: "playAudio",
			data: url,
		});
	}

	audio.pause();
	audio.src = url;
	audio.play();
}

export function httpRequest(
	url: string,
	options?: Options & { resMethod?: keyof ResponsePromise }
) {
	return browser.runtime.sendMessage({
		type: "httpRequest",
		data: {
			url,
			options,
		},
	});
}

export async function getActiveTab() {
	const tabs = await browser.tabs.query({ active: true, currentWindow: true });
	return tabs[0];
}

export async function sendMessageToTab(
	msg: { type: string; data?: any },
	tabId?: number
) {
	const activeTab = await getActiveTab();
	return browser.tabs.sendMessage(tabId ?? activeTab.id, msg);
}

export function getRootElement(): HTMLElement {
	return isContentScript()
		? document.getElementById("honyaku").shadowRoot.querySelector("main")
		: document.documentElement;
}

export function getScrollContainer() {
	return (
		document.getElementById("honyaku")?.shadowRoot || document
	).querySelector("[data-scrollbar-content]");
}

export function writableStore<T = unknown>(value: T) {
	const _store = writable(value);

	function set(newValue: T) {
		value = newValue;
		_store.set(newValue);
	}

	function get() {
		return value;
	}

	function update(fn: (v: T) => T) {
		set(fn(value));
	}

	return {
		set,
		get,
		update,
		subscribe: _store.subscribe,
	};
}

export function t(msg: string, substitutions?: string | string[]) {
	return i18n.getMessage(msg, substitutions);
}
