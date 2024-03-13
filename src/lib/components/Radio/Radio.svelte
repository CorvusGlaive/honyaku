<script lang="ts">
	import clsx from "clsx";
	import { getContext, type Snippet } from "svelte";
	import type { RadioType } from "./RadioGroup.svelte";

	interface Props {
		value?: any;
		group?: any;
		class?: string;
		checked?: boolean;
		onchange?: (value: any) => void;
		children: Snippet;
	}
	let {
		value,
		group,
		class: className = "",
		checked,
		children,
	} = $props<Props>();

	let groupCtx = getContext<{ val: any } | undefined>("group");
	const dir = getContext<RadioType>("dir");

	let _group = $derived(groupCtx?.val ?? group);
	let groupClasses = $derived(
		clsx(
			_group !== value && "hover:bg-surface-100 dark:hover:bg-surface-600/50",
			"has-[:checked]:bg-brand-500 has-[:checked]:text-white has-[:checked]:hover:bg-brand-400",
		),
	);
	let classes = $derived(
		clsx(
			"p-2",
			"cursor-pointer",
			"inline-flex",
			"items-center",
			"gap-2",
			"transition-colors",
			dir && groupClasses,
			className,
		),
	);

	function handleChange() {
		if (!groupCtx) {
			group = value;
			return;
		}
		group = value;
		groupCtx.val = value;
	}
</script>

<label class={classes}>
	<input
		type="radio"
		checked={checked ?? value === _group}
		{value}
		class:hidden={dir}
		onchange={handleChange}
	/>
	{@render children()}
</label>
