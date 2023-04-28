<script lang="ts">
	import Icon from "~/lib/components/Icon.svelte";
	import srv, { type Service } from "~/services";
	import type { HistoryEntry } from "~/lib/history";
	import { store } from "~/store";
	import { i18n, runtime } from "webextension-polyfill";
	import { onMount, tick } from "svelte";

	export let selectedText = "";

	const { translationApi } = store;

	let selectedHistory: HistoryEntry = undefined;
	let service: Service = null;
	let isShowResult = false;
	let showCmpResult: typeof showResult;

	$: query = selectedText;

	onMount(() =>
		srv.currentService().subscribe((_service) => {
			if (isShowResult) return (isShowResult = false);
			query = selectedText ?? "";
			selectedHistory = null;
			service = _service;
		})
	);

	export async function showResult(res: HistoryEntry) {
		if (service.name !== res.service) {
			isShowResult = true;
			$translationApi = res.service;
			service = srv.getServiceByName(res.service);
		}

		query = res.query;
		selectedHistory = res;
		await tick();
		showCmpResult?.(res.result);
	}

	function handleInputClear() {
		selectedHistory = null;
	}

	function getFavicon(url: string | URL) {
		if (!url || url === "internal")
			return runtime.getURL("/icons/cherry-32.png");
		url = new URL(url);
		if (runtime.getURL("").startsWith(url.origin)) {
			return runtime.getURL("/icons/cherry-32.png");
		}
		return `https://www.google.com/s2/favicons?sz=32&domain_url=${url.host}`;
	}

	const isInternalPage = (url: string) =>
		url.startsWith("chrome:") || url.startsWith("about:");
	const isSettingsPage = () => {
		if (!document.URL.startsWith(runtime.getURL(""))) return false;
		return document.title.toLowerCase().includes("settings");
	};
</script>

<div class="flex flex-col gap-2" class:flex-col-reverse={isSettingsPage()}>
	<div>
		<svelte:component
			this={service?.component}
			bind:showResult={showCmpResult}
			{query}
			on:clear={handleInputClear}
		/>
	</div>
	{#if selectedHistory}
		<div class="surface-2 card divide-y">
			{#each Object.entries(selectedHistory.sources) as [source, [title, timestamp, isPopup]]}
				<div class="flex flex-col gap-1 break-words p-2">
					<a
						rel="noreferrer"
						target="_blank"
						class="flex items-center gap-2 hover:underline"
						href={source}
						{title}
					>
						{#if isInternalPage(source)}
							{#if source.startsWith("chrome")}
								<Icon viewBox={24}>
									<path
										d="M9.827 21.763C5.35 20.771 2 16.777 2 12c0-1.822.487-3.53 1.339-5.002l4.283 7.419a4.999 4.999 0 0 0 4.976 2.548l-2.77 4.798zM12 22l4.287-7.425A4.977 4.977 0 0 0 17 12a4.978 4.978 0 0 0-1-3h5.542A9.98 9.98 0 0 1 22 12c0 5.523-4.477 10-10 10zm2.572-8.455a2.999 2.999 0 0 1-5.17-.045l-.029-.05a3 3 0 1 1 5.225.05l-.026.045zm-9.94-8.306A9.974 9.974 0 0 1 12 2a9.996 9.996 0 0 1 8.662 5H12a5.001 5.001 0 0 0-4.599 3.035L4.632 5.239z"
									/>
								</Icon>
							{:else}
								<Icon viewBox={24}>
									<path
										d="M6.85 6.74c.01 0 .01 0 0 0M21.28 8.6c-.43-1.05-1.32-2.18-2.01-2.54c.56 1.11.89 2.22 1.02 3.04v.02c-1.13-2.82-3.05-3.96-4.62-6.44c-.08-.12-.17-.25-.24-.38c-.04-.07-.07-.14-.11-.21c-.06-.13-.12-.26-.15-.4c0-.01-.01-.02-.02-.02h-.03c-2.22 1.3-3.15 3.59-3.38 5.04c-.69.04-1.37.21-1.99.51c-.12.05-.17.19-.13.31c.05.14.21.21.34.15c.54-.26 1.14-.41 1.74-.45h.05c.08-.01.17-.01.25-.01c.5-.01.97.06 1.44.2l.06.02c.1.02.17.06.25.06c.05.04.11.06.16.08l.14.06c.07.03.14.06.2.09c.03.02.06.03.09.05c.07.04.16.07.2.11c.04.02.08.05.12.07c.73.45 1.34 1.07 1.75 1.81c-.53-.37-1.49-.74-2.41-.58c3.6 1.81 2.63 8-2.36 7.76c-.44-.01-.88-.1-1.3-.25c-.1-.03-.2-.07-.29-.12c-.05-.02-.12-.05-.17-.08c-1.23-.63-2.24-1.82-2.38-3.27c0 0 .5-1.73 3.33-1.73c.31 0 1.17-.86 1.2-1.1c0-.09-1.74-.78-2.42-1.45c-.37-.36-.54-.53-.69-.66c-.08-.07-.17-.13-.26-.19a4.63 4.63 0 0 1-.03-2.45C7.6 6.12 6.8 6.86 6.22 7.5c-.4-.5-.37-2.15-.35-2.5c-.01 0-.3.16-.33.18c-.35.25-.68.53-.98.82c-.35.37-.66.74-.94 1.14c-.62.91-1.12 1.95-1.34 3.04c0 .01-.1.41-.17.92l-.03.23c-.02.17-.04.32-.08.58v.41c0 5.53 4.5 10.01 10 10.01c4.97 0 9.08-3.59 9.88-8.33c.02-.11.03-.24.05-.37c.2-1.72-.02-3.52-.65-5.03Z"
									/>
								</Icon>
							{/if}
						{:else}
							<img class="w-4" alt="favicon" src={getFavicon(source)} />
						{/if}
						{#if isPopup}
							<Icon className="shrink-0" title="popup">
								<path
									d="M28 4H10a2.006 2.006 0 0 0-2 2v14a2.006 2.006 0 0 0 2 2h18a2.006 2.006 0 0 0 2-2V6a2.006 2.006 0 0 0-2-2Zm0 16H10V6h18Z"
								/><path
									d="M18 26H4V16h2v-2H4a2.006 2.006 0 0 0-2 2v10a2.006 2.006 0 0 0 2 2h14a2.006 2.006 0 0 0 2-2v-2h-2Z"
								/>
							</Icon>
						{/if}
						<span class="overflow-hidden text-ellipsis whitespace-nowrap"
							>{title}</span
						></a
					>
					<span
						class="inline-flex gap-2 text-xs text-surface-300 dark:text-surface-600"
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
						}).format(new Date(timestamp))}</span
					>
				</div>
			{/each}
		</div>
	{/if}
</div>
