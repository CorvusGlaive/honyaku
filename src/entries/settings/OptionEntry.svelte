<script lang="ts" generics="T">
	import clsx from "clsx";
	import Input from "~/lib/components/Input.svelte";

	interface Props {
		title?: string;
		value: T;
		disabled?: boolean;
		description?: string;
		class?: string;
		onchange?: (value: T) => void;
	}
	let {
		title = "",
		value,
		disabled = false,
		description = "",
		class: className = "",
		onchange,
	} = $props<Props>();

	let type: "radio" | "checkbox" | "text" | "color" = $state("radio");

	$effect(() => {
		switch (typeof value) {
			case "boolean":
				type = "checkbox";
				break;
			case "string":
				if (value.length === 7 && value[0] === "#") type = "color";
				else type = "text";
				break;
			default:
				type = "radio";
		}
	});

	function handleChange(e: Event) {
		let target = e.currentTarget as HTMLInputElement;
		let value: T;
		switch (type) {
			case "checkbox":
				value = target.checked as T;
				break;
			default:
				value = target.value as T;
				break;
		}
		onchange?.(value);
	}

	const radioClasses =
		"transition-colors rounded cursor-pointer hover:bg-surface-300/20";
	let classes = $derived(
		clsx(
			(type === "radio" || type === "checkbox") && radioClasses,
			disabled && "pointer-events-none opacity-50",
			"p-2 flex gap-2 justify-between items-center",
			className,
		),
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
		<input
			class="shrink-0"
			type="checkbox"
			checked={value as boolean}
			onchange={handleChange}
		/>
	{:else if type === "text"}
		<Input class="w-min" value={value as string} onchange={handleChange} />
	{:else if type === "color"}
		<Input type="color" value={value as string} onchange={handleChange} />
	{:else}
		<input {type} {value} onchange={handleChange} />
	{/if}
</label>
