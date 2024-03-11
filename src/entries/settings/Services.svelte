<script lang="ts">
	import Section from "~/lib/components/Section.svelte";
	import { store } from "~/store.svelte";
	import { t } from "~/lib/utils";
	import OptionEntry from "./OptionEntry.svelte";

	const { services, translationApi } = store;

	function toggleService(name: string, settings: any) {
		settings.enabled = !settings.enabled;
		services.val[name] = settings;

		if (settings.enabled) return;

		const newService = Object.entries(services.val).find(([_, s]) => s.enabled);
		if (!newService?.length) return;
		translationApi.val = newService[0];
	}

	function getSettingsInfo(service: string, title: string) {
		const _title =
			t(`${service}Settings${title.toUpperCase()}Title`) || undefined;
		const desc = t(`${service}Settings${title.toUpperCase()}Desc`) || undefined;
		return [_title, desc];
	}
</script>

{#each Object.entries(services.val) as [name, settings]}
	<Section title={name} class="w-3/4">
		<OptionEntry
			title={t("serviceSettingsEnableTitle")}
			value={settings.enabled}
			onchange={() => toggleService(name, settings)}
		/>
		<OptionEntry
			disabled={!settings.enabled}
			title={t("serviceSettingsColorTitle")}
			value={settings.color}
			description={t("serviceSettingsColorDesc")}
			onchange={(e) => (settings.color = e)}
		/>
		{#each Object.entries(settings?.settings || {}) as [settingsTitle, value]}
			{@const [title, desc] = getSettingsInfo(name, settingsTitle)}
			<OptionEntry
				disabled={!settings.enabled}
				{title}
				{value}
				description={desc}
				onchange={(e) => (settings.settings[settingsTitle] = e)}
			/>
		{/each}
	</Section>
{/each}
