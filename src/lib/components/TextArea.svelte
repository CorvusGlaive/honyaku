<script lang="ts">
	import clsx from "clsx";

	import { afterUpdate, getContext, onMount } from "svelte";

	export let value = "";
	export let placeholder = "Translate...";
	export let autofocus = false;
	export let isMainInput = false;

	const group = getContext("group");
	let textareaRef: HTMLTextAreaElement;

	onMount(() => {
		autofocus && textareaRef.focus();

		const resObserver = new ResizeObserver(() => {
			textareaRef.style.height = textareaRef.scrollHeight + "px";
		});
		resObserver.observe(textareaRef);

		return () => resObserver.disconnect();
	});

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
		$$props.class
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
		$$props.class
	);
</script>

<textarea
	bind:this={textareaRef}
	bind:value
	data-is-main-input={isMainInput}
	on:change
	on:input
	on:keydown
	{placeholder}
	class={group ? groupCss : defaultCss}
/>
