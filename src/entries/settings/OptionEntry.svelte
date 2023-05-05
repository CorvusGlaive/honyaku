<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import clsx from "clsx";
	import { onMount } from "svelte";
	import Input from "~/lib/components/Input.svelte";

	export let title = "";
	export let value: any;
	export let disabled = false;
	export let description: string = "";

	const dispatch = createEventDispatcher();

	let type: "radio" | "checkbox" | "text" | "color";

	onMount(() => {
		if (typeof value === "boolean") return (type = "checkbox");
		if (typeof value === "string") {
			if (value.length === 7 && value[0] === "#") return (type = "color");
			return (type = "text");
		}
	});

	function handleChange(e: Event) {
		let target = e.currentTarget as HTMLInputElement;
		let value: unknown;
		switch (type) {
			case "checkbox":
				value = target.checked;
				break;
			default:
				value = target.value;
				break;
		}
		dispatch("change", value);
	}

	const radioClasses =
		"transition-colors rounded cursor-pointer hover:bg-surface-300/20";
	$: classes = clsx(
		type === "radio" && radioClasses,
		type === "checkbox" && radioClasses,
		disabled && "pointer-events-none opacity-50",
		"p-2 flex gap-2 justify-between items-center",
		$$props.class
	);
</script>

<label class={classes}>
	<div>
		<span>{title || "Title"}</span>
		{#if description}
			<p class="text-xs opacity-50">{description}</p>
		{/if}
	</div>
	{#if type === "checkbox"}
		<input class="shrink-0" type="checkbox" checked={value} on:change={handleChange} />
	{:else if type === "text"}
		<Input class="w-min" {value} on:change={handleChange} />
	{:else if type === "color"}
		<Input type="color" {value} on:change={handleChange} />
	{:else}
		<input {type} {value} on:change={handleChange} />
	{/if}
</label>
