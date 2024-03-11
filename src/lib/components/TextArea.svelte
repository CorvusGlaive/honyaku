<script lang="ts">
	import clsx from "clsx";

	import { getContext } from "svelte";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	interface Props extends HTMLTextareaAttributes {
		isMainInput?: boolean;
	}
	let {
		value = "",
		placeholder = "Translate...",
		autofocus = false,
		isMainInput = false,
		class: className,
		oninput,
		...props
	} = $props<Props>();

	const group = getContext("group");
	let textareaRef: HTMLTextAreaElement;

	$effect(() => {
		autofocus && textareaRef.focus();
	});

	function onInput(e: any) {
		textareaRef.style.height = "auto";
		textareaRef.style.height = textareaRef.scrollHeight + "px";
		oninput?.(e);
	}

	const defaultCss = clsx(
		"surface-2",
		"card",
		"scrollbar",
		"max-h-60",
		"w-full",
		"resize-none",
		"overflow-auto",
		"px-2",
		"py-1.5",
		"placeholder-surface-500",
		"outline-none",
		"ring-2",
		"ring-transparent",
		"transition-shadow",
		"focus:shadow-md",
		"focus:ring-brand-400",
		className,
	);

	const groupCss = clsx(
		"scrollbar",
		"max-h-60",
		"w-full",
		"resize-none",
		"bg-transparent",
		"px-2",
		"py-1.5",
		"outline-none",
		className,
	);
</script>

<textarea
	bind:this={textareaRef}
	bind:value
	data-is-main-input={isMainInput}
	{placeholder}
	class={group ? groupCss : defaultCss}
	oninput={onInput}
	{...props}
/>
