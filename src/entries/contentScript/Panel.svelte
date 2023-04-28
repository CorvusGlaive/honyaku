<script lang="ts">
	import Button from "~/lib/components/Button.svelte";
	import srv from "~/services";
	import { getGlobalShortcuts } from "~/lib/keymapps";
	import { onMount } from "svelte";
	import { scale } from "svelte/transition";
	import { store } from "~/store";
	import {
		computePosition,
		flip,
		shift,
		offset as offsetM,
	} from "@floating-ui/dom";
	import Scrollbar from "~/lib/components/Scrollbar.svelte";
	import TranslationServices from "~/services/TranslationServices.svelte";

	const { translationApi, fontSize } = store;

	export let ref = null;
	export let pos = { x: 0, y: 0, cx: 0, cy: 0 };
	export let selectedText = "";

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

	onMount(() => {
		if (!ref) return;

		computePosition(virtualEl, ref, {
			middleware: [offsetM(offset), flip(), shift({ padding: offset })],
		}).then(({ x, y }) => {
			Object.assign(ref.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
		});
	});
</script>

<svelte:window on:keydown|capture={getGlobalShortcuts()} />

<div
	id="panel"
	on:keydown={(e) => e.stopPropagation()}
	on:keyup={(e) => e.stopPropagation()}
	on:keypress={(e) => e.stopPropagation()}
	transition:scale={{ duration: 200 }}
	bind:this={ref}
	style="top: {pos.y}px; left: {pos.x}px;"
	class="main absolute z-[134217727] h-80 w-80 overflow-hidden overscroll-contain rounded-md text-left shadow-2xl ring-1 ring-surface-400 dark:ring-surface-600"
>
	<Scrollbar>
		<nav
			class="path group absolute inset-y-[auto] inset-x-0 top-0 z-[3] rounded-md p-1 shadow-lg overflow-hidden outline outline-1 outline-surface-400/30 transition-all hover:m-1 hover:bg-white dark:hover:bg-surface-800"
		>
			<div class="absolute inset-0 bg-amber-500 group-hover:hidden" />
			<div class="flex gap-1">
				{#each srv.services as service (service.name)}
					<Button
						on:click={() => {
							$translationApi = service.name;
						}}
						active={$translationApi === service.name}>{service.name}</Button
					>
				{/each}
			</div>
		</nav>
		<section class="p-2">
			<TranslationServices {selectedText} />
		</section>
	</Scrollbar>
</div>

<style lang="postcss">
	.path {
		clip-path: circle(3% at 3% 23%);
		&:hover {
			clip-path: circle(300% at 0 0);
		}
	}
</style>
