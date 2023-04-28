<script lang="ts">
	import Section from "~/lib/components/Section.svelte";
	import ShortcutInput from "./ShortcutInput.svelte";
	import { keymaps, setKey, resetKey } from "~/lib/keymapps";
	import type { ComponentEvents } from "svelte";

	function handleChange(
		group: string,
		action: string,
		e: ComponentEvents<ShortcutInput>["change"]
	) {
		console.log("shortcuts:handleChange", `${group}-${action}`, e.detail);
		if (!e.detail) return;
		setKey(e.detail, action, group);
	}

	function handleReset(group: string, action: string) {
		const path = `${group}_${action}`;
		console.log("shortcuts:handleReset", path);

		resetKey(action, group);
	}

	function splitString(str: string): string {
		return str.split("").reduce((acc, cur, i) => {
			if (i === 0) return (acc += cur.toUpperCase());
			acc += cur >= "A" && cur <= "Z" ? ` ${cur.toLowerCase()}` : cur;
			return acc;
		}, "");
	}
</script>

{#each $keymaps as [group, maps] (group)}
	<Section title={group} class="w-1/2">
		{#each maps as [action, keys] (action)}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="mb-2 grid gap-1 font-medium">
				<span>{splitString(action)}</span>
				<ShortcutInput
					{keys}
					on:change={(e) => handleChange(group, action, e)}
					on:reset={() => handleReset(group, action)}
				/>
			</label>
		{/each}
	</Section>
{/each}
