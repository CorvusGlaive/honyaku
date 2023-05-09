<script lang="ts">
	import HistoryInput from "./HistoryInput.svelte";
	import HistoryList from "./HistoryList.svelte";
	import Portal from "~/lib/components/Portal.svelte";
	import Scrollbar from "~/lib/components/Scrollbar.svelte";

	import { getAllHistory, type HistoryEntry } from "./history";
	import { registerKeymaps } from "~/lib/keymapps";

	import Fuse from "fuse.js";
	import { createEventDispatcher, type ComponentEvents } from "svelte";
	import { debounce } from "lodash-es";

	export let isModal = true;
	export let open = !isModal;

	let query = "";
	let items: HistoryEntry[] = [];
	let filtered = items;

	const dispatch = createEventDispatcher<{ select: HistoryEntry }>();
	const classes = "surface-2 card flex flex-col divide-y";
	const debSearchHistory = debounce(searchHistory, 300);
	const fuse = new Fuse(items, {
		keys: [
			{ name: "query", weight: 0.7 },
			{ name: "service", weight: 0.3 },
		],
		useExtendedSearch: true,
	});

	$: if (!query) {
		filtered = items;
		debSearchHistory.cancel();
	}
	$: open && getHistory();
	$: !open && (query = "");

	async function getHistory() {
		const history = (await getAllHistory()).reverse();
		fuse.setCollection(history);
		items = history;
	}

	function searchHistory(e: InputEvent) {
		const value = (e.target as HTMLInputElement).value.trim();
		if (!value) return;
		filtered = fuse.search(value).map((it) => it.item);
	}

	function selectItem({
		detail: item,
	}: ComponentEvents<HistoryList>["select"]) {
		if (isModal) open = false;
		dispatch("select", item);
	}

	const keymaps = registerKeymaps(
		{
			"i-c-BracketLeft": (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();
				open = false;
			},
		},
		{
			condition: () => open,
		}
	);
</script>

<svelte:window on:keydown={keymaps} />

{#if isModal && open}
	<Portal class="absolute inset-0 flex items-center justify-center p-4">
		<Scrollbar
			class="z-[1] w-full"
			containerClasses="{classes} z-[1] h-full w-full overflow-auto"
		>
			<HistoryInput
				bind:query
				{isModal}
				on:input={debSearchHistory}
				on:close={() => (open = false)}
			/>
			<HistoryList items={filtered} on:select={selectItem} />
		</Scrollbar>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		{#if isModal}
			<div
				id="back"
				class="absolute inset-0 bg-surface-500/30"
				on:click={() => (open = false)}
			/>
		{/if}
	</Portal>
{/if}

{#if !isModal}
	<div class={classes}>
		<HistoryInput bind:query {isModal} on:input={debSearchHistory} />
		<HistoryList items={filtered} on:select={selectItem} />
	</div>
{/if}
