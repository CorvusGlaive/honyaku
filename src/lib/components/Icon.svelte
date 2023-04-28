<script lang="ts">
	import { store } from "~/store";

	/**
If you pass `number`, it'll be used as px scaled according to the `fontsize` settings.
Use `string` if you want to use other units e.g `12em`.
Pass `false` if you don't want to set size directly.
	*/
	export let size: number | string | boolean = 16;
	export let className = "";
	export let viewBox: number | string = 32;
	export let title = "";
	export let color = "currentColor";

	let svg: SVGElement;

	$: vbSize =
		typeof viewBox === "number" ? `0 0 ${viewBox} ${viewBox}` : viewBox;
	$: svg && resize(size);

	function resize(size: number | string | boolean) {
		if (typeof size === "boolean") return;
		if (typeof size === "string") {
			Object.assign(svg.style, { width: size, height: size });
			return;
		}

		let fs: string | number = store.fontSize.get();
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
		<slot />
	</g>
</svg>
