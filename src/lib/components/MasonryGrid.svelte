<script lang="ts">
	import { MasonryGrid, type MasonryGridOptions } from "@egjs/grid";
	import type { Snippet } from "svelte";

	interface Props extends MasonryGridOptions {
		children: Snippet;
		deps?: any;
	}
	let { children, deps, ...props } = $props<Props>();
	let container: HTMLElement | undefined = $state();
	let grid: MasonryGrid;

	$effect(() => {
		deps;
		grid?.syncElements();
	});

	$effect(() => {
		grid = new MasonryGrid(container!, { ...props });
		grid.renderItems();
		return () => grid?.destroy();
	});
</script>

<div bind:this={container}>
	{@render children()}
</div>
