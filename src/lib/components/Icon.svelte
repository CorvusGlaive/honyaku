<script lang="ts">
	import type { Snippet } from "svelte";
	import { store } from "~/store.svelte";

	interface Props {
		/**
If you pass `number`, it'll be used as px scaled according to the `fontsize` settings.
Use `string` if you want to use other units e.g `12em`.
Pass `false` if you don't want to set size directly.
	*/
		size?: number | string | boolean;
		class?: string;
		viewBox?: number | string;
		title?: string;
		color?: string;
		children: Snippet;
	}
	let {
		size = 16,
		class: className = "",
		viewBox = 32,
		title = "",
		color = "currentColor",
		children,
	} = $props<Props>();

	let svg: SVGElement;

	let vbSize = $derived(
		typeof viewBox === "number" ? `0 0 ${viewBox} ${viewBox}` : viewBox,
	);

	$effect(() => {
		svg && resize(size);
	});

	function resize(size: number | string | boolean) {
		if (typeof size === "boolean") return;
		if (typeof size === "string") {
			Object.assign(svg.style, { width: size, height: size });
			return;
		}

		let fs: string | number = store.fontSize.val;
		fs = fs === "medium" ? 16 : fs === "small" ? 14 : 18;
		fs = fs / 16;
		Object.assign(svg.style, {
			width: `${size * fs}px`,
			height: `${size * fs}px`,
		});
	}
</script>

<svg bind:this={svg} viewBox={vbSize} class={className}>
	{#if title}
		<title>{title}</title>
	{/if}
	<g fill={color}>
		{@render children()}
	</g>
</svg>
