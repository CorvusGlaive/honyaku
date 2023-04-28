<script lang="ts">
	import { RadioGroup } from "~/lib/components/Radio";
	import Section from "~/lib/components/Section.svelte";
	import ThemeSwitcher from "./ThemeSwitcher.svelte";
	import { store } from "~/store";
	import Colors from "./Colors.svelte";

	const { fontSize } = store;
	const fontSizes = [
		{ value: "small", label: "Small" },
		{ value: "medium", label: "Medium" },
		{ value: "large", label: "Large" },
	];
</script>

<Section title="Font size">
	<RadioGroup
		items={fontSizes}
		value={$fontSize}
		on:change={(e) => ($fontSize = e.detail)}
	/>
</Section>

<Section title="Theme">
	<ThemeSwitcher />
</Section>

<Section title="Accent Color">
	<Colors />
</Section>
