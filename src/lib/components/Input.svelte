<script lang="ts">
	import clsx from "clsx";

	import CloseIcon from "../icons/CloseIcon.svelte";
	import SendIcon from "../icons/SendIcon.svelte";
	import Button from "./Button.svelte";
	import Icon from "./Icon.svelte";
	import { tick, type Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";

	interface Props extends HTMLInputAttributes {
		value?: string;
		autofocus?: boolean;
		isMainInput?: boolean;
		type?: "text" | "search" | "color";
		ref?: HTMLInputElement;
		left?: Snippet;
		children?: Snippet;
		onclear?: () => void;
		onsend?: () => void;
	}

	let {
		value = "",
		autofocus = false,
		isMainInput = false,
		type = "text",
		ref = undefined,
		class: className = "",
		left,
		children,
		onclear,
		onsend,
		...props
	} = $props<Props>();

	$effect(() => {
		type === "search" && ref && (ref.value = value);
	});

	$effect(() => {
		autofocus && ref?.focus();
	});

	const defaultCss = clsx(
		"surface-2",
		"card",
		"w-full",
		"relative",
		"px-2",
		"py-1.5",
		"outline-none",
		"ring-2",
		"ring-transparent",
		"transition-shadow",
		"focus:ring-brand-400",
		className,
	);

	const searchInputCss = clsx(
		"w-full",
		"bg-transparent",
		"px-2",
		"py-1.5",
		"outline-none",
		className,
	);

	const searchCss = clsx(
		"surface-2",
		"card",
		"inline-flex",
		"ring",
		"ring-2",
		"ring-transparent",
		"transition-all",
		"overflow-hidden",
		"focus-within:ring-brand-400",
		className,
	);
</script>

{#if type === "text"}
	<input
		bind:this={ref}
		bind:value
		class={defaultCss}
		data-is-main-input={isMainInput}
		type="text"
		{...props}
	/>
{:else if type === "search"}
	<div class={searchCss}>
		{#if left}
			{@render left()}
		{/if}
		<input
			type="text"
			bind:this={ref}
			bind:value
			class={searchInputCss}
			data-is-main-input={isMainInput}
			{...props}
		/>
		{#if children}
			{@render children()}
		{/if}
		{#if value}
			<Button icon class="p-2" onclick={onclear}>
				<Icon title="Clear input field">
					<CloseIcon variant="outline" />
				</Icon>
			</Button>
		{/if}
		<Button
			icon
			onclick={onsend}
			class="border-l !border-l-surface-500/10 bg-surface-100 p-2 hover:!bg-brand-300 hover:!text-brand-900 dark:bg-surface-700"
		>
			<Icon><SendIcon /></Icon>
		</Button>
	</div>
{:else if type === "color"}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="card surface-2 inline-flex items-center justify-between gap-2 p-1 {className}"
	>
		<input
			type="text"
			spellcheck="false"
			{value}
			onchange={async (e) => {
				value = e.currentTarget.value;
				await tick();
				ref?.dispatchEvent(new Event("change"));
			}}
			class="w-[7ch] bg-transparent font-mono leading-none outline-none"
		/>
		<button
			class="size-[1.36em] rounded"
			style="background-color: {value || 'black'};"
			onclick={() => ref?.showPicker()}
		/>
		<input
			type="color"
			class="hidden"
			bind:this={ref}
			bind:value
			onchange={props.onchange}
		/>
	</div>
{/if}
