<script lang="ts">
	import { Portal, Scrollbar, Input, Icon, Button } from "~/lib/components";
	import { CloseIcon } from "~/lib/icons";

	import { getAllHistory, deleteHistory, type HistoryEntry } from "./history";
	import { registerKeymaps } from "~/lib/keymapps";
	import { store } from "~/store.svelte";

	import { i18n } from "webextension-polyfill";
	import Fuse from "fuse.js";
	import type { FormEventHandler } from "svelte/elements";

	interface Props {
		isModal?: boolean;
		open?: boolean;
		onselect?: (item: HistoryEntry) => void;
	}
	let { isModal = true, open = false, onselect } = $props<Props>();
	open = !isModal;

	let query = $state("");
	let items = $state<HistoryEntry[]>([]);
	let filtered = $state<HistoryEntry[]>([]);
	let historyCount = $derived(items.length);

	const { services } = store;
	const classes = "surface-2 card flex flex-col divide-y";
	const debSearchHistory = debounced(searchHistory, 500);
	const fuse = new Fuse<HistoryEntry>([], {
		keys: [
			{ name: "query", weight: 0.7 },
			{ name: "service", weight: 0.3 },
		],
		useExtendedSearch: true,
	});

	$effect(() => {
		if (!query) {
			filtered = items;
			debSearchHistory.cancel();
		}
	});
	$effect(() => {
		if (open) getHistory();
		else query = "";
	});

	function debounced(fn: (...args: any[]) => any, time: number) {
		let timer: number;

		function debFn(this: any) {
			let _this = this;
			let _args = arguments;
			clearTimeout(timer);
			timer = window.setTimeout(() => fn.apply(_this, _args as any), time);
		}
		debFn.cancel = () => clearTimeout(timer);

		return debFn;
	}

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

	function selectItem(item: HistoryEntry) {
		if (isModal) open = false;
		onselect?.(item);
	}

	function deleteItem(item: HistoryEntry) {
		deleteHistory(item.keys);
		getHistory();
	}

	function deleteAll() {
		deleteHistory();
		items.length = 0;
		fuse.setCollection([]);
		document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
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
		},
	);
</script>

<svelte:window onkeydown={keymaps} />

{#snippet input()}
	<div
		class="surface-2 card sticky top-0 flex items-center gap-2 p-2 shadow-none"
	>
		<Input
			bind:value={query}
			autofocus
			oninput={debSearchHistory as any as FormEventHandler<HTMLInputElement>}
			class="surface-3 w-auto leading-4"
		/>
		{#if isModal}
			<Button
				class="rounded-full hover:bg-brand-400/10"
				icon
				onclick={() => (open = false)}
			>
				<Icon size={27}><CloseIcon /></Icon>
			</Button>
		{/if}
	</div>
{/snippet}

{#snippet list()}
	{#each filtered as item (item.keys)}
		<button
			onclick={() => selectItem(item)}
			class="group px-4 py-2 text-left outline-none ring-2 ring-inset ring-transparent hover:bg-surface-100/50 focus-visible:ring-brand-400 dark:hover:bg-surface-700/50"
		>
			<p
				class="flex items-center font-bold"
				style="color: {services.val?.[item.service]?.color || 'inherit'}"
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
					}).format(new Date(item.time!))}</span
				>
			</p>
			<p class="grid grid-cols-[1fr_auto] items-center gap-2">
				<span>{item.query}</span>
				<Button
					icon
					onclick={(e) => {
						e.stopPropagation();
						deleteItem(item);
					}}
					class="text-surface-500/50 opacity-0 hover:text-red-500 group-hover:opacity-100"
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
{/snippet}

{#if isModal && open}
	<Portal class="absolute inset-0 flex items-center justify-center p-4">
		<Scrollbar
			class="z-[1] w-full"
			containerClasses="{classes} z-[1] h-full w-full overflow-auto"
		>
			{@render input()}
			{@render list()}
		</Scrollbar>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			id="back"
			class="absolute inset-0 bg-surface-500/30"
			onclick={() => (open = false)}
		/>
	</Portal>
{/if}

{#if !isModal}
	<div class={classes}>
		{@render input()}
		{@render list()}
	</div>
	{#if historyCount > 0}
		<button
			class="card mt-2 w-full bg-red-500 p-2 font-bold text-white transition-colors hover:bg-red-400"
			onclick={deleteAll}>Delete all</button
		>
	{/if}
{/if}
