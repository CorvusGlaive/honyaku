<script lang="ts">
	import Icon from "~/lib/components/Icon.svelte";
	import Button from "~/lib/components/Button.svelte";
	import { store } from "~/store";

	import { createEventDispatcher } from "svelte";
	import { fly } from "svelte/transition";
	import { i18n } from "webextension-polyfill";
	import type { HistoryEntry } from "./history";

	const dispatch = createEventDispatcher<{
		select: HistoryEntry;
		delete: HistoryEntry;
	}>();
	const { services } = store;

	export let items: HistoryEntry[] = [];
</script>

{#if items.length > 0}
	{#each items as item (item.keys)}
		<button
			out:fly|local={{ x: 200, duration: 200 }}
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
			<p class="grid grid-cols-[1fr_auto] items-center gap-2">
				<span>{item.query}</span>
				<Button
					icon
					on:click={(e) => {
						e.stopPropagation();
						dispatch("delete", item);
					}}
					className="opacity-0 group-hover:opacity-100 text-surface-500/50 hover:text-red-500"
				>
					<Icon>
						<path d="M12 12h2v12h-2zm6 0h2v12h-2z" /><path
							d="M4 6v2h2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8h2V6zm4 22V8h16v20zm4-26h8v2h-8z"
						/>
					</Icon>
				</Button>
			</p>
		</button>
	{/each}
{/if}
