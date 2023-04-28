<script lang="ts">
	import Section from "~/lib/components/Section.svelte";
	import { store } from "~/store";
	import { t } from "~/lib/utils";
	import OptionEntry from "./OptionEntry.svelte";

	const { services, translationApi } = store;

	function toggleService(name: string, settings: any) {
		settings.enabled = !settings.enabled;
		$services[name] = settings;

		if (settings.enabled) return;

		const newService = Object.entries($services).find(([_, s]) => s.enabled);
		if (!newService.length) return;
		$translationApi = newService[0];
	}

	function getDescription(service: string, title: string) {
		return t(`${service}Settings${title.toUpperCase()}`) || null;
	}
</script>

{#each Object.entries($services) as [name, settings]}
	<Section title={name} class="w-3/4">
		<OptionEntry
			title={"enable"}
			value={settings.enabled}
			on:change={() => toggleService(name, settings)}
		/>
		<OptionEntry
			disabled={!settings.enabled}
			title={"color"}
			value={settings.color}
			description={t("serviceSettingsColor")}
			on:change={(e) => (
				console.log(name, settings, e), (settings.color = e.detail)
			)}
		/>
		{#each Object.entries(settings?.settings || {}) as [title, value]}
			<OptionEntry
				disabled={!settings.enabled}
				{title}
				{value}
				description={getDescription(name, title)}
				on:change={(e) => (settings.settings[title] = e.detail)}
			/>
		{/each}
	</Section>
{/each}
