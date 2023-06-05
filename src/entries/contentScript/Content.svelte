<script lang="ts">
	import "~/lib/index.css";
	import Button from "./Button.svelte";
	import Panel from "./Panel.svelte";
	import { isScrollThumbHold } from "~/lib/components/Scrollbar.svelte";
	import { registerKeymaps } from "~/lib/keymapps";
	import { initAppearance } from "../settings/appearance";

	initAppearance();

	let selectedText = "";
	let pos = { x: 0, y: 0, cx: 0, cy: 0 };
	let isShowPanel = false;
	let isShowButton = false;
	let panelRef: HTMLDivElement;
	let buttonRef: HTMLButtonElement;
	let isScrollbarHold = false;

	function handleMouseDown() {
		isScrollbarHold = isScrollThumbHold.get();
	}

	async function handleMouseUp(e: MouseEvent) {
		const eventPath = e.composedPath();
		await new Promise((res) => setTimeout(res, 10));

		if (
			["TEXTAREA", "INPUT", "VIDEO"].includes((e.target as HTMLElement).tagName)
		)
			return;
		if (eventPath.includes(buttonRef)) return;
		if (eventPath.includes(panelRef)) return;
		if (isScrollbarHold) return;

		const selection = window.getSelection();
		selectedText = selection.isCollapsed ? "" : selection.toString();
		isShowButton = Boolean(selectedText);
		isShowPanel = false;
		pos = { x: e.pageX, y: e.pageY, cx: e.clientX, cy: e.clientY };
	}

	const contentShortcuts = registerKeymaps(
		{
			Escape: () => {
				isShowPanel = false;
				isShowButton = false;
			},
		},
		{
			condition: () => isShowButton || isShowPanel,
		}
	);
</script>

<svelte:window
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:keydown|capture={contentShortcuts}
/>

{#if isShowButton}
	<Button
		bind:ref={buttonRef}
		on:click={() => {
			isShowPanel = true;
			isShowButton = false;
		}}
		{pos}
	/>
{/if}
{#if isShowPanel}
	<Panel {selectedText} {pos} bind:ref={panelRef} />
{/if}
