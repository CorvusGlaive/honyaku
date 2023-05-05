<script lang="ts">
	import clsx from "clsx";

	import { createEventDispatcher, onMount } from "svelte";
	import CloseIcon from "../icons/CloseIcon.svelte";
	import SendIcon from "../icons/SendIcon.svelte";
	import Button from "./Button.svelte";
	import Icon from "./Icon.svelte";
	import { tick } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface $$Props extends HTMLAttributes<HTMLInputElement> {
		value?: string;
		autofocus?: boolean;
		isMainInput?: boolean;
		type?: "text" | "search" | "color";
		ref?: HTMLInputElement;
	}

	export let value = "";
	export let autofocus = false;
	export let isMainInput = false;
	export let type: $$Props["type"] = "text";

	export let ref: HTMLInputElement = null;

	const dispatch = createEventDispatcher();
	$: type === "search" && ref && (ref.value = value);

	onMount(() => {
		autofocus && ref.focus();
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
		$$props.class
	);

	const searchInputCss = clsx(
		"w-full",
		"bg-transparent",
		"px-2",
		"py-1.5",
		"outline-none",
		$$props.class
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
		$$props.class
	);

	// Hack around Wanakana.bind for Firefox, which doesn't update value if there is two-way bindings
	function bindValue(node: HTMLInputElement) {
		const handler = (e: InputEvent) =>
			(value = (e.target as HTMLInputElement).value);
		node.addEventListener("keyup", handler);
		return {
			destroy() {
				node.removeEventListener("keyup", handler);
			},
		};
	}
</script>

{#if type === "text"}
	<input
		bind:this={ref}
		bind:value
		class={defaultCss}
		data-is-main-input={isMainInput}
		on:change
		on:input
		on:keydown
		on:keyup
		type="text"
	/>
{/if}

{#if type === "search"}
	<div class={searchCss}>
		<slot name="left" />
		<input
			type="text"
			bind:this={ref}
			use:bindValue
			class={searchInputCss}
			data-is-main-input={isMainInput}
			on:change
			on:input
			on:keydown
			on:keyup
		/>
		<slot />
		{#if value}
			<Button icon className="p-2" on:click={() => dispatch("clear")}>
				<Icon title="Clear input field">
					<CloseIcon variant="outline" />
				</Icon>
			</Button>
		{/if}
		<Button
			icon
			on:click={() => dispatch("send")}
			className="p-2 bg-surface-100 hover:!bg-brand-300 hover:!text-brand-900 border-l !border-l-surface-500/10 dark:bg-surface-700"
		>
			<Icon><SendIcon /></Icon>
		</Button>
	</div>
{/if}

{#if type === "color"}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="card surface-2 inline-flex items-center justify-between gap-2 p-1 {$$props.class ||
			''}"
	>
		<input
			type="text"
			spellcheck="false"
			{value}
			on:change={async (e) => {
				value = e.currentTarget.value;
				await tick();
				ref.dispatchEvent(new Event("change"));
			}}
			class="w-[7ch] bg-transparent font-mono leading-none outline-none"
		/>
		<div
			class="h-[1.36em] w-[1.36em] rounded"
			style="background-color: {value || 'black'};"
			on:click={() => ref.showPicker()}
		/>
		<input type="color" class="hidden" bind:this={ref} bind:value on:change />
	</div>
{/if}
