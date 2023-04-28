<script lang="ts" context="module">
	export type RadioType = "hor" | "ver";
</script>

<script lang="ts">
	import clsx from "clsx";

	import { createEventDispatcher, setContext } from "svelte";
	import { writable } from "svelte/store";
	import Radio from "./Radio.svelte";

	interface $$slots {
		default: { item: { label: string; value: string } };
	}
	const dispatch = createEventDispatcher();

	export let value: any = undefined;
	export let dir: RadioType = "hor";
	export let block = false;
	export let items: { label: string; value: string }[] = undefined;

	const group = writable(value);
	setContext("group", group);
	setContext("dir", dir);

	$: {
		value = $group;
		dispatch("change", $group);
	}

	const buttonClasses = "grid-flow-col divide-x";
	const listClasses = "divide-y";
	const classNames = clsx(
		"surface-2 card overflow-hidden",
		"leading-normal",
		block ? "grid" : "inline-grid",
		dir === "ver" && listClasses,
		dir === "hor" && buttonClasses,
		$$props.class
	);
</script>

<fieldset class={classNames}>
	{#if items?.length > 0}
		{#each items as item}
			<slot {item}>
				<Radio bind:group={value} value={item.value}>{item.label}</Radio>
			</slot>
		{/each}
	{:else}
		<slot item={{ label: "NONE", value: "NONE" }} />
	{/if}
</fieldset>
