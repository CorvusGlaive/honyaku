import { onMount } from "svelte";
import { getRootElement } from "~/lib/utils";
import { store } from "~/store";
import type { StoreType } from "~/store";

export default () =>
	onMount(() => {
		return store.fontSize.subscribe((size) => {
			applyFontSize(getFontSize(size));
		});
	});

function getFontSize(size: StoreType<"fontSize">): number {
	switch (size) {
		case "small":
			return 14;
		case "medium":
			return 16;
		case "large":
			return 18;
		default:
			return 16;
	}
}

function applyFontSize(size: number) {
	const root = getRootElement();
	root.style.setProperty("--font-size", `${size}px`);
}
