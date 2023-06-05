<script lang="ts">
	import { scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import {
		computePosition,
		flip,
		offset as offsetM,
		shift,
	} from "@floating-ui/dom";
	import { onMount } from "svelte";
	import { runtime } from "webextension-polyfill";

	export let pos = { x: 0, y: 0, cx: 0, cy: 0 };
	export let ref = null;
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

<button
	bind:this={ref}
	on:click
	on:contextmenu
	transition:scale={{ duration: 300, easing: quintOut }}
	style="font-size: medium;"
	class="absolute z-[134217727] flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-pink-100 p-1 text-lg shadow-md shadow-pink-300 ring-1 ring-pink-300 transition-transform ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-125 dark:bg-rose-900 dark:shadow-pink-500 dark:ring-pink-500"
>
	<img src={runtime.getURL("/icons/cherry.svg")} alt="icon" />
</button>
