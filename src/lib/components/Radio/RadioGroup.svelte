<svelte:options runes={true} />

<script lang="ts" context="module">
	export type RadioType = "hor" | "ver";
</script>

<script lang="ts">
	import clsx from "clsx";

	import { setContext, untrack, type Snippet } from "svelte";
	import Radio from "./Radio.svelte";

	interface Props {
		value?: any;
		items?: { label: string; value: any }[];
		dir?: RadioType;
		class?: string;
		block?: boolean;
		onchange?: (value: any) => void;
		custom?: Snippet<[{ label: string; value: string }]>;
		children?: Snippet;
	}

	let {
		value,
		items,
		dir = "hor",
		block,
		class: className,
		onchange,
		custom,
		children,
	} = $props<Props>();

	let group = $state(value);
	setContext("group", {
		get val() {
			return group;
		},
		set val(v) {
			group = v;
		},
	});
	setContext("dir", dir);

	$effect(() => {
		let v = untrack(() => value);
		if (v !== group) onchange?.(group);
	});
	$effect(() => {
		let g = untrack(() => group);
		if (value === g) return;
		group = value;
	});

	const buttonClasses = "grid-flow-col divide-x";
	const listClasses = "divide-y";
	const classes = clsx(
		"surface-2 card overflow-hidden",
		"leading-normal",
		block ? "grid" : "inline-grid",
		dir === "ver" && listClasses,
		dir === "hor" && buttonClasses,
		className,
	);
</script>

<fieldset class={classes}>
	{#if items}
		{#each items as item}
			{#if custom}
				{@render custom(item)}
			{:else}
				<Radio value={item.value}>{item.label}</Radio>
			{/if}
		{/each}
	{:else if children}
		{@render children()}
	{/if}
</fieldset>
