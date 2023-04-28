import { getScrollContainer } from "../utils";
import { registerKeymaps } from "./keymapps";

export const getGlobalShortcuts = () => {
	const container = getScrollContainer();
	const containerHeight = container.getBoundingClientRect().height;
	const delta = 57;
	let getInputEl = () =>
		container.querySelector("[data-is-main-input=true]") as HTMLElement;
	const scrollByHandler =
		(amount: number) =>
		({ repeat }: KeyboardEvent) =>
			container.scrollBy({
				top: amount,
				//@ts-ignore
				behavior: repeat ? "instant" : "smooth",
			});

	return registerKeymaps(
		{
			j: ["scrollDown", scrollByHandler(delta)],
			k: ["scrollUp", scrollByHandler(-delta)],
			"c-d": ["scrollPageDown", scrollByHandler(containerHeight / 2)],
			"c-u": ["scrollPageUp", scrollByHandler(-containerHeight / 2)],
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
					getInputEl().blur();
				},
			],
			"i-Enter": () => {
				const inputEl = getInputEl() as HTMLInputElement;
				if (!inputEl.value.trim()) return;
				inputEl.blur();
			},
			g: [
				"scrollToTop",
				() => {
					container.scrollTo({ top: 0, behavior: "smooth" });
				},
			],
			"s-g": [
				"scrollToBottom",
				() => {
					container.scrollTo({
						top: container.scrollHeight,
						behavior: "smooth",
					});
				},
			],
		},
		{ group: "global" }
	);
};
