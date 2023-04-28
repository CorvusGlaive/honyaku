<script lang="ts">
	import "~/lib/index.css";
	import { onMount } from "svelte";
	import { store } from "~/store";
	import browser from "webextension-polyfill";
	import srv from "~/services";
	import Button from "~/lib/components/Button.svelte";
	import Icon from "~/lib/components/Icon.svelte";
	import { sendMessageToTab } from "~/lib/utils";
	import { getGlobalShortcuts } from "~/lib/keymapps";
	import Scrollbar from "~/lib/components/Scrollbar.svelte";
	import TranslationServices from "~/services/TranslationServices.svelte";
	import History from "~/lib/components/History.svelte";
	import { initAppearance } from "~/entries/settings/appearance";

	const { translationApi } = store;

	let selectedText = "";
	let showResult;
	initAppearance();

	onMount(() => {
		sendMessageToTab({ type: "getSelectedText" })
			.then((text) => (selectedText = text))
			.catch(() => {});
	});

	function handleWindowKeyDown(e: KeyboardEvent) {
		const keyNum = e.code.match(/Digit(\d)/)?.[1];

		if (e.code === "Slash") {
			e.preventDefault();
			showHistory = true;
			return;
		}
		if (!e.altKey || keyNum === undefined) return;
		e.preventDefault();

		$translationApi = srv.services.at(parseInt(keyNum) - 1).name;
	}
	let showHistory = false;
</script>

<svelte:window
	on:keydown|capture={handleWindowKeyDown}
	on:keydown|capture={getGlobalShortcuts()}
/>

<main class="relative h-[26em] w-[26em] overflow-hidden">
	<Scrollbar>
		<nav
			class="sticky top-0 z-[3] flex items-center gap-1 border-b-[1px] border-b-surface-300 bg-surface-200 px-2 py-1 dark:border-b-surface-700 dark:bg-surface-800"
		>
			{#each srv.services as service}
				<Button
					on:click={(_) => ($translationApi = service.name)}
					active={$translationApi === service.name}>{service.name}</Button
				>
			{/each}
			<History
				bind:open={showHistory}
				on:select={(e) => showResult(e.detail)}
			/>
			<Button
				icon
				className="group ml-auto"
				on:click={() => (showHistory = !showHistory)}
			>
				<Icon title="Recently searched" size={18}
					><path
						class="origin-center transition-transform duration-500 ease-in-out group-hover:rotate-full"
						d="M20.59 22L15 16.41 15 7 17 7 17 15.58 22 20.59 20.59 22z"
					/><path
						class="origin-center transition-transform duration-500 ease-in-out group-hover:-rotate-full"
						d="M16,2A13.94,13.94,0,0,0,6,6.23V2H4v8h8V8H7.08A12,12,0,1,1,4,16H2A14,14,0,1,0,16,2Z"
					/></Icon
				>
			</Button>
			<Button
				className="!transition-all ml-2 !ease-in-out !duration-500 hover:rotate-180"
				icon
				on:click={() => browser.runtime.openOptionsPage()}
			>
				<Icon title="Settings" size={18}>
					<path
						d="M27,16.76c0-.25,0-.5,0-.76s0-.51,0-.77l1.92-1.68A2,2,0,0,0,29.3,11L26.94,7a2,2,0,0,0-1.73-1,2,2,0,0,0-.64.1l-2.43.82a11.35,11.35,0,0,0-1.31-.75l-.51-2.52a2,2,0,0,0-2-1.61H13.64a2,2,0,0,0-2,1.61l-.51,2.52a11.48,11.48,0,0,0-1.32.75L7.43,6.06A2,2,0,0,0,6.79,6,2,2,0,0,0,5.06,7L2.7,11a2,2,0,0,0,.41,2.51L5,15.24c0,.25,0,.5,0,.76s0,.51,0,.77L3.11,18.45A2,2,0,0,0,2.7,21L5.06,25a2,2,0,0,0,1.73,1,2,2,0,0,0,.64-.1l2.43-.82a11.35,11.35,0,0,0,1.31.75l.51,2.52a2,2,0,0,0,2,1.61h4.72a2,2,0,0,0,2-1.61l.51-2.52a11.48,11.48,0,0,0,1.32-.75l2.42.82a2,2,0,0,0,.64.1,2,2,0,0,0,1.73-1L29.3,21a2,2,0,0,0-.41-2.51ZM25.21,24l-3.43-1.16a8.86,8.86,0,0,1-2.71,1.57L18.36,28H13.64l-.71-3.55a9.36,9.36,0,0,1-2.7-1.57L6.79,24,4.43,20l2.72-2.4a8.9,8.9,0,0,1,0-3.13L4.43,12,6.79,8l3.43,1.16a8.86,8.86,0,0,1,2.71-1.57L13.64,4h4.72l.71,3.55a9.36,9.36,0,0,1,2.7,1.57L25.21,8,27.57,12l-2.72,2.4a8.9,8.9,0,0,1,0,3.13L27.57,20Z"
					/><path
						d="M16,22a6,6,0,1,1,6-6A5.94,5.94,0,0,1,16,22Zm0-10a3.91,3.91,0,0,0-4,4,3.91,3.91,0,0,0,4,4,3.91,3.91,0,0,0,4-4A3.91,3.91,0,0,0,16,12Z"
					/>
				</Icon>
			</Button>
		</nav>
		<section class="p-2">
			<TranslationServices bind:showResult {selectedText} />
		</section>
	</Scrollbar>
</main>
