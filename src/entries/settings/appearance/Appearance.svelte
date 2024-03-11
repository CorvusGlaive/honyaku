<script lang="ts">
	import { RadioGroup, Section } from "~/lib/components";
	import ThemeSwitcher from "./ThemeSwitcher.svelte";
	import { store } from "~/store.svelte";
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
		value={fontSize.val}
		items={fontSizes}
		onchange={(e) => (fontSize.val = e)}
	/>
</Section>

<Section title="Theme">
	<ThemeSwitcher />
</Section>

<Section title="Accent Color">
	<Colors />
</Section>
