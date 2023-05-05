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

	function getSettingsInfo(service: string, title: string) {
		const _title = t(`${service}Settings${title.toUpperCase()}Title`) || null;
		const desc = t(`${service}Settings${title.toUpperCase()}Desc`) || null;
		return [_title, desc];
	}
</script>

{#each Object.entries($services) as [name, settings]}
	<Section title={name} class="w-3/4">
		<OptionEntry
			title={t("serviceSettingsEnableTitle")}
			value={settings.enabled}
			on:change={() => toggleService(name, settings)}
		/>
		<OptionEntry
			disabled={!settings.enabled}
			title={t("serviceSettingsColorTitle")}
			value={settings.color}
			description={t("serviceSettingsColorDesc")}
			on:change={(e) => (settings.color = e.detail)}
		/>
		{#each Object.entries(settings?.settings || {}) as [settingsTitle, value]}
			{@const [title, desc] = getSettingsInfo(name, settingsTitle)}
			<OptionEntry
				disabled={!settings.enabled}
				{title}
				{value}
				description={desc}
				on:change={(e) => (settings.settings[settingsTitle] = e.detail)}
			/>
		{/each}
	</Section>
{/each}
