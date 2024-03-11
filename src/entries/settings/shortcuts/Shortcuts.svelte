<script lang="ts">
	import Section from "~/lib/components/Section.svelte";
	import ShortcutInput from "./ShortcutInput.svelte";
	import { setKey, resetKey } from "~/lib/keymapps";
	import { store } from "~/store.svelte";

	const keymaps = $derived.by(
		() =>
			Object.entries(store.keymaps.val).map(([group, actions]) => [
				group,
				Object.entries(actions),
			]) as [group: string, actions: [id: string, keys: [string, string]][]][],
	);

	function handleChange(group: string, action: string, key: string) {
		if (!key) return;
		setKey(key, action, group);
	}

	function splitString(str: string): string {
		return str.split("").reduce((acc, cur, i) => {
			if (i === 0) return (acc += cur.toUpperCase());
			acc += cur >= "A" && cur <= "Z" ? ` ${cur.toLowerCase()}` : cur;
			return acc;
		}, "");
	}
</script>

{#each keymaps as [group, maps] (group)}
	<Section title={group} class="w-1/2">
		{#each maps as [action, keys] (action)}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="mb-2 grid gap-1 font-medium">
				<span>{splitString(action)}</span>
				<ShortcutInput
					{keys}
					onchange={(e) => handleChange(group, action, e)}
					onreset={() => resetKey(action, group)}
				/>
			</label>
		{/each}
	</Section>
{/each}
