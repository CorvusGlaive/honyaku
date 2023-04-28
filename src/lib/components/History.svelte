<script lang="ts">
	import Button from "./Button.svelte";
	import CloseIcon from "../icons/CloseIcon.svelte";
	import Fuse from "fuse.js";
	import Icon from "./Icon.svelte";
	import Input from "./Input.svelte";
	import Portal from "./Portal.svelte";
	import Scrollbar from "./Scrollbar.svelte";
	import { getAllHistory, type HistoryEntry } from "../history";
	import { registerKeymaps } from "../keymapps";
	import { store } from "~/store";

	import { createEventDispatcher } from "svelte";
	import { i18n } from "webextension-polyfill";
	import clsx from "clsx";

	export let isModal = true;
	export let open = !isModal;
	export let target: HTMLElement | string = undefined;

	let query = "";
	let items: HistoryEntry[] = [];
	let filtered = items;

	const { services } = store;
	const dispatch = createEventDispatcher();
	const fuse = new Fuse(items, {
		keys: [
			{ name: "query", weight: 0.7 },
			{ name: "service", weight: 0.3 },
		],
		useExtendedSearch: true,
	});

	$: if (!query) {
		filtered = items;
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

	function selectItem(item: HistoryEntry) {
		if (isModal) open = false;
		dispatch("select", item);
	}

	const keymaps = registerKeymaps(
		{
			"i-c-BracketLeft": (e) => {
				console.log("HistoryModal:keymaps", e);
				e.preventDefault();
				e.stopImmediatePropagation();
				open = false;
			},
		},
		{
			condition: () => open,
		}
	);
	$: classes = clsx(
		"flex",
		"items-center",
		"justify-center",
		isModal && "absolute inset-0 p-4"
	);
</script>

<svelte:window on:keydown={keymaps} />

{#if open}
	<Portal {target} zIndex={isModal ? 10 : 0} class={classes}>
		<Scrollbar
			class="z-[1] w-full"
			containerClasses="surface-2 card z-[1] flex h-full w-full flex-col divide-y overflow-auto"
		>
			<div
				class="surface-2 card sticky top-0 flex items-center gap-2 p-2 shadow-none"
			>
				<Input
					bind:value={query}
					autofocus
					on:input={searchHistory}
					class="surface-3 w-auto leading-4"
				/>
				{#if isModal}
					<Button
						className="rounded-full hover:bg-brand-400/10"
						icon
						on:click={() => (open = false)}
					>
						<Icon size={27}><CloseIcon /></Icon>
					</Button>
				{/if}
			</div>
			{#each filtered as item (item.keys)}
				<button
					on:click={() => selectItem(item)}
					class="px-4 py-2 text-left outline-none ring-2 ring-inset ring-transparent hover:bg-surface-100/50 focus-visible:ring-brand-400 dark:hover:bg-surface-700/50"
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
