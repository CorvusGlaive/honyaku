<script lang="ts">
	import { setContext, type Snippet } from "svelte";
	import clsx from "clsx";

	interface Props {
		tag?: string;
		class?: string;
		left?: Snippet;
		right?: Snippet;
		children: Snippet;
	}
	let {
		tag = "div",
		class: className = "",
		left,
		right,
		children,
	} = $props<Props>();

	setContext("group", true);

	const defaultCss = clsx(
		"surface-2",
		"card",
		"inline-grid",
		"ring",
		"ring-2",
		"ring-transparent",
		"transition-all",
		"focus-within:ring-brand-400",
		left && "grid-cols-[auto_1fr_auto]",
		left || "grid-cols-[1fr_auto]",
		className,
	);
</script>

<svelte:element this={tag} class={defaultCss}>
	{#if left}
		{@render left()}
	{/if}
	{@render children()}
	{#if right}
		{@render right()}
	{/if}
</svelte:element>
