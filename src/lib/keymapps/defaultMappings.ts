import { getScrollContainer } from "../utils";
import { registerKeymaps } from "./keymapps";

//TODO: getScrollContainer returns null, because callback in <svelte:window onkeydown> runs before template, so DOM is still 'empty' at this point
export const getGlobalShortcuts = () => {
	let cnt: Element | undefined | null;
	const container = () => (cnt ??= getScrollContainer());
	const delta = 57;
	let getInputEl = () =>
		container()?.querySelector(
			"[data-is-main-input=true]",
		) as HTMLElement | null;
	const scrollByHandler =
		(dirAmount: number, isHalfPage: boolean = false) =>
		({ repeat }: KeyboardEvent) => {
			let c = container()!;
			let amount = isHalfPage
				? dirAmount * (c.getBoundingClientRect().height / 2)
				: dirAmount;
			c.scrollBy({
				top: amount,
				behavior: repeat ? "instant" : "smooth",
			});
		};

	return registerKeymaps(
		{
			j: ["scrollDown", scrollByHandler(delta)],
			k: ["scrollUp", scrollByHandler(-delta)],
			"c-d": ["scrollPageDown", scrollByHandler(1, true)],
			"c-u": ["scrollPageUp", scrollByHandler(-1, true)],
			i: [
				"focusInput",
				() => {
					const inputEl = getInputEl();
					if (!inputEl) return;
					inputEl.focus({ preventScroll: true });
					inputEl.scrollIntoView({
						block: "center",
						behavior: "smooth",
					});
				},
			],
			"i-c-BracketLeft": [
				"unfocusInput",
				(e) => {
					e.preventDefault();
					getInputEl()?.blur();
				},
			],
			"i-Enter": () => {
				const inputEl = getInputEl() as HTMLInputElement;
				if (!inputEl?.value.trim()) return;
				inputEl?.blur();
			},
			g: [
				"scrollToTop",
				() => {
					container()?.scrollTo({ top: 0, behavior: "smooth" });
				},
			],
			"s-g": [
				"scrollToBottom",
				() => {
					container()?.scrollTo({
						top: container()?.scrollHeight,
						behavior: "smooth",
					});
				},
			],
		},
		{ group: "global" },
	);
};
