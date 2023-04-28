<script lang="ts">
	import { noop } from "svelte/internal";
	import type { Action } from "svelte/action";
	import clsx from "clsx";

	export let active = false;
	export let className = "";
	export let disabled = false;
	export let ref: HTMLButtonElement = null;
	export let use: { action: Action; options?: any } = { action: noop };
	export let icon = false;

	const buttonCss =
		"rounded-md px-2 py-1 leading-normal text-sm capitalize shadow outline-none ring-2 ring-transparent transition-all focus:ring-brand-400 focus-visible:ring-brand-400";
	const normalCss =
		"bg-white hover:bg-surface-100 active:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 dark:active:bg-surface-500";
	const activeCss =
		"bg-brand-500 font-bold text-white hover:bg-brand-400 active:bg-brand-600";
	const disabledCss =
		"disabled:bg-surface-50 disabled:text-surface-300 disabled:shadow-none disabled:dark:bg-surface-800 disabled:dark:text-surface-700 disabled:cursor-default";
	const iconCss = "transition-colors hover:text-brand-400";

	$: classes = icon
		? clsx(iconCss, className)
		: clsx(
				buttonCss,
				active && activeCss,
				!active && normalCss,
				disabled && disabledCss,
				className
		  );
</script>

<button
	use:use.action={use.options}
	bind:this={ref}
	on:click
	{disabled}
	class={classes}
	{...$$restProps}
>
	<slot />
</button>
