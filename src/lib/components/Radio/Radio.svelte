<script lang="ts">
	import clsx from "clsx";
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";
	import type { RadioType } from "./RadioGroup.svelte";

	export let value: unknown = undefined;
	export let group: unknown = undefined;
	export let className: string = "";
	export let checked = false;

	const groupCtx: Writable<unknown> = getContext("group");
	const dir = getContext<RadioType>("dir");

	$: group = $groupCtx || group;

	$: groupClasses = clsx(
		group !== value && "hover:bg-surface-100 dark:hover:bg-surface-600/50",
		// "[&:has(:checked)]:bg-brand-500 [&:has(:checked)]:text-white [&:has(:checked)]:hover:bg-brand-400", //:has doesn't work in firefox, should be available in a first half of 23.
		group === value && "bg-brand-500 text-white hover:bg-brand-400"
	);
	$: classNames = clsx(
		"p-2",
		"cursor-pointer",
		"inline-flex",
		"items-center",
		"gap-2",
		"transition-colors",
		dir && groupClasses,
		$$props.class
	);

	function handleChange() {
		if (!groupCtx) return;
		$groupCtx = value;
	}
</script>

<label class="{classNames} {className}">
	<input
		type="radio"
		{checked}
		{value}
		bind:group
		class:hidden={dir}
		on:change={handleChange}
	/>
	<slot />
</label>
