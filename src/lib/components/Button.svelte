<script lang="ts">
	import type { Action } from "svelte/action";
	import clsx from "clsx";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	interface Props extends HTMLButtonAttributes {
		active?: boolean;
		icon?: boolean;
		ref?: HTMLButtonElement;
		use?: { action: Action; options?: any };
		children: Snippet;
	}
	let {
		class: className = "",
		active = false,
		disabled = false,
		ref = undefined,
		use = { action: () => undefined },
		icon = false,
		children,
		...props
	} = $props<Props>();

	const buttonCss =
		"rounded-md px-2 py-1 leading-normal text-sm capitalize shadow outline-none ring-2 ring-transparent transition-all focus:ring-brand-400 focus-visible:ring-brand-400";
	const normalCss =
		"bg-white hover:bg-surface-100 active:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 dark:active:bg-surface-500";
	const activeCss =
		"bg-brand-500 font-bold text-white hover:bg-brand-400 active:bg-brand-600";
	const disabledCss =
		"disabled:bg-surface-50 disabled:text-surface-300 disabled:shadow-none disabled:dark:bg-surface-800 disabled:dark:text-surface-700 disabled:cursor-default";
	const iconCss = "transition-colors hover:text-brand-400";

	let classes = $derived(
		icon
			? clsx(iconCss, className)
			: clsx(
					buttonCss,
					active && activeCss,
					!active && normalCss,
					disabled && disabledCss,
					className,
				),
	);
</script>

<button
	use:use.action={use.options}
	bind:this={ref}
	{disabled}
	class={classes}
	{...props}
>
	{@render children()}
</button>
