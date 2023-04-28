<script lang="ts">
	import { store } from "~/store";
	import twColors from "tailwindcss/colors";
	import Input from "~/lib/components/Input.svelte";

	const colors = filterTwColors();
	const { accentColor } = store;

	function filterTwColors() {
		return [
			"red",
			"orange",
			"amber",
			"yellow",
			"lime",
			"green",
			"emerald",
			"teal",
			"cyan",
			"sky",
			"blue",
			"indigo",
			"violet",
			"purple",
			"fuchsia",
			"pink",
			"rose",
		].map((color) => [color, twColors[color]]);
	}
</script>

<fieldset class="mb-2 grid grid-cols-[repeat(4,_min-content)] gap-2">
	{#each colors as [name, color]}
		<button
			class="h-8 w-8 cursor-pointer rounded transition-transform hover:scale-125 {$accentColor ===
			name
				? 'ring-[3px] ring-brand-900 dark:ring-brand-300'
				: ''}"
			style="background-color: {color['500']};"
			title={name}
			on:click={() => accentColor.set(name)}
		/>
	{/each}
	<Input
		type="color"
		class="col-span-3"
		value={$accentColor.startsWith("#") ? $accentColor : "#000000"}
		on:change={(e) => {
			//@ts-ignore
			$accentColor = e.currentTarget.value;
		}}
	/>
</fieldset>
