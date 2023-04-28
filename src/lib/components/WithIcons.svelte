<script lang="ts">
	import { setContext } from "svelte";
	import clsx from "clsx";

	export let tag = "div";

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
		$$slots.left && "grid-cols-[auto_1fr_auto]",
		$$slots.left || "grid-cols-[1fr_auto]",
		$$props.class
	);
</script>

<svelte:element this={tag} class={defaultCss}>
	<slot name="left" />
	<slot />
	<slot name="right" />
</svelte:element>
