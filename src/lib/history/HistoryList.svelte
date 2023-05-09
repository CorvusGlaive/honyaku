<script lang="ts">
	import Icon from "~/lib/components/Icon.svelte";
	import { store } from "~/store";

	import { createEventDispatcher } from "svelte";
	import { i18n } from "webextension-polyfill";
	import type { HistoryEntry } from "./history";

	const dispatch = createEventDispatcher<{ select: HistoryEntry }>();
	const { services } = store;

	export let items: HistoryEntry[] = [];
</script>

{#each items as item (item.keys)}
	<button
		on:click={() => dispatch("select", item)}
		class="group px-4 py-2 text-left outline-none ring-2 ring-inset ring-transparent hover:bg-surface-100/50 focus-visible:ring-brand-400 dark:hover:bg-surface-700/50"
	>
		<p
			class="flex items-center font-bold"
			style="color: {$services?.[item.service]?.color || 'inherit'}"
		>
			{item.service}
			<span
				class="ml-auto flex gap-1 text-xs font-normal text-surface-300 dark:text-surface-600"
				><Icon title="Time">
					<path
						d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z"
					/><path
						d="M20.59 22L15 16.41 15 7 17 7 17 15.58 22 20.59 20.59 22z"
					/>
				</Icon>{new Intl.DateTimeFormat(i18n.getUILanguage(), {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					weekday: "short",
					month: "short",
					day: "numeric",
					year: "2-digit",
				}).format(new Date(item.time))}</span
			>
		</p>
		<span>{item.query}</span>
	</button>
{/each}
