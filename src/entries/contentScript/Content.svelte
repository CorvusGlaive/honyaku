<script lang="ts">
	import "~/lib/index.css";
	import { scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import {
		computePosition,
		flip,
		offset as offsetM,
		shift,
	} from "@floating-ui/dom";
	import { runtime } from "webextension-polyfill";

	import { getGlobalShortcuts, registerKeymaps } from "~/lib/keymapps";
	import { initAppearance } from "../settings/appearance/index.svelte";
	import srv from "~/services";
	import { store } from "~/store.svelte";

	import TranslationServices from "~/services/TranslationServices.svelte";
	import Scrollbar, {
		isScrollThumbHold,
	} from "~/lib/components/Scrollbar.svelte";
	import Button from "~/lib/components/Button.svelte";

	initAppearance();
	const { translationApi } = store;

	let selectedText = $state("");
	let pos = $state({ x: 0, y: 0, cx: 0, cy: 0 });
	let isShowPanel = $state(false);
	let isShowButton = $state(false);
	let ref: HTMLElement | undefined = $state();
	let shouldAutoTranslate = $state(false);

	let offset = 10;
	const virtualEl = {
		getBoundingClientRect() {
			return {
				x: pos.cx,
				y: pos.cy,
				top: pos.cy,
				left: pos.cx,
				right: pos.cx,
				bottom: pos.cy,
				width: 0,
				height: 0,
			};
		},
	};

	$effect(() => {
		if (!ref) return;
		computePosition(virtualEl, ref, {
			middleware: [offsetM(offset), flip(), shift({ padding: offset })],
		}).then(({ x, y }) => {
			Object.assign(ref!.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
		});
	});

	async function handleMouseUp(e: any) {
		const eventPath = e.composedPath();

		if (
			["TEXTAREA", "INPUT", "VIDEO"].includes((e.target as HTMLElement).tagName)
		)
			return;
		if (ref && eventPath.includes(ref)) return;
		if (isScrollThumbHold()) return;
		if (shouldAutoTranslate) return (shouldAutoTranslate = false);

		const selection = window.getSelection()!;
		selectedText = selection.isCollapsed ? "" : selection.toString();
		isShowButton = Boolean(selectedText);
		isShowPanel = false;
		pos = { x: e.pageX, y: e.pageY, cx: e.clientX, cy: e.clientY };
	}

	function handleButtonClick(e: any) {
		e.preventDefault();
		shouldAutoTranslate = e.type === "contextmenu";
		isShowPanel = true;
		isShowButton = false;
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
		},
	);
	const globalShortcuts = getGlobalShortcuts();
</script>

<svelte:window
	onmouseup={handleMouseUp}
	onkeydowncapture={(e) => (contentShortcuts(e), globalShortcuts(e))}
/>

{#snippet button()}
	<button
		bind:this={ref}
		on:click={handleButtonClick}
		on:contextmenu={handleButtonClick}
		transition:scale={{ duration: 300, easing: quintOut }}
		style="font-size: medium;"
		class="absolute z-[134217727] flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-pink-100 p-1 text-lg shadow-md shadow-pink-300 ring-1 ring-pink-300 transition-transform ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-125 dark:bg-rose-900 dark:shadow-pink-500 dark:ring-pink-500"
	>
		<img src={runtime.getURL("/icons/cherry.svg")} alt="icon" />
	</button>
{/snippet}

{#snippet panel()}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		id="panel"
		bind:this={ref}
		on:keydown={(e) => e.stopPropagation()}
		on:keyup={(e) => e.stopPropagation()}
		on:keypress={(e) => e.stopPropagation()}
		transition:scale={{ duration: 200 }}
		style="top: {pos.y}px; left: {pos.x}px;"
		class="main absolute z-[134217727] h-80 w-80 overflow-hidden overscroll-contain rounded-md text-left shadow-2xl ring-1 ring-surface-400 dark:ring-surface-600"
	>
		<Scrollbar>
			<nav
				class="path group absolute inset-x-0 inset-y-[auto] top-0 z-[3] overflow-hidden rounded-md p-1 shadow-lg outline outline-1 outline-surface-400/30 transition-all hover:m-1 hover:bg-white dark:hover:bg-surface-800"
			>
				<div class="absolute inset-0 bg-amber-500 group-hover:hidden" />
				<div class="flex gap-1">
					{#each srv.services as service (service.name)}
						<Button
							onclick={() => {
								translationApi.val = service.name;
							}}
							active={translationApi.val === service.name}
							>{service.name}</Button
						>
					{/each}
				</div>
			</nav>
			<section class="p-2">
				<TranslationServices {shouldAutoTranslate} {selectedText} />
			</section>
		</Scrollbar>
	</div>
{/snippet}

{#if isShowButton}
	{@render button()}
{/if}
{#if isShowPanel}
	{@render panel()}
{/if}

<style lang="postcss">
	.path {
		clip-path: circle(3% at 3% 23%);
		&:hover {
			clip-path: circle(300% at 0 0);
		}
	}
</style>
