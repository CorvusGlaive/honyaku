<script lang="ts" context="module">
	import { initService } from "../utils";

	const { name } = initService({
		name: "jisho",
		color: "emerald",
	});
</script>

<script lang="ts">
	import {
		AudioButton,
		Button,
		Icon,
		Input,
		Popover,
		Spinner,
	} from "~/lib/components";
	import { CopyIcon, SendIcon } from "~/lib/icons";

	import type { JishoResponse } from "./types";
	import { parseDom } from "./utils";
	import { Query } from "~/lib/query.svelte";
	import { httpRequest } from "~/lib/utils";
	import { registerKeymaps } from "~/lib/keymapps";
	import type { ServiceProps } from "../types";

	import { toKana } from "wanakana";
	import { fade } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	let { query, onclear } = $props<ServiceProps>();
	export function showResult(he: JishoResponse) {
		if (!he) return q.setState("initial");
		q.setState("success", he);
	}
	export function translate(query: string) {
		query = query.trim();
		if (!query) return;
		q.fetch(query);
	}

	const q = new Query(name, _translate);

	let showKanjiSection = $state(false);
	let isKanaInput = $state(false);

	async function _translate(query: string) {
		if (!query.trim()) throw new Error("Query is empty");

		let page: string | Document;

		page = await httpRequest(
			"https://jisho.org/search/" + encodeURIComponent(query),
			{ bodyMethod: "text" },
		);
		page = new DOMParser().parseFromString(page as string, "text/html");
		let result = parseDom(page);

		return { result, keys: [query] };
	}

	function handleKeyDown(e: KeyboardEvent) {
		// https://github.com/sveltejs/svelte/issues/9714
		// calls this event three times due to the listeners on <svelte:window onkeydowncapture/>.
		// doesn't happen in bubble mode.
		if ("__root" in e) return;
		if (e.key !== "Enter") return;
		const value = (e.target as HTMLInputElement).value;
		if (!value) return;
		e.preventDefault();
		q.fetch(value);
	}

	function handleInput(e: any) {
		const { value } = e.target;
		if (!isKanaInput) {
			query = value;
			return;
		}
		// Hack around Wanakana.bind for Firefox, which doesn't update value if there is two-way bindings
		setTimeout(() => (query = toKana(value, { IMEMode: true })), 0);
	}

	const handleWindowKeydown = registerKeymaps(
		{
			"s-k": ["showKanjiSection", () => (showKanjiSection = !showKanjiSection)],
			"i-c-k": [
				"toggleKanaInput",
				(e) => (e.preventDefault(), (isKanaInput = !isKanaInput)),
			],
		},
		{ group: name as string },
	);
</script>

<svelte:window onkeydowncapture={handleWindowKeydown} />

<div class="relative flex flex-col gap-2">
	<div
		class="grid"
		class:gap-1={q.data?.kanjis?.length}
		style="grid-template-columns: 1fr max-content;"
	>
		<Input
			type="search"
			value={query}
			isMainInput={true}
			autofocus
			oninput={handleInput}
			onkeydown={handleKeyDown}
			onclear={() => {
				query = "";
				q.setState("initial");
				onclear?.();
			}}
			onsend={() => q.fetch(query)}
		>
			{#snippet left()}
				<button
					onclick={() => (isKanaInput = !isKanaInput)}
					class="whitespace-nowrap border-r border-r-surface-500/10 bg-gray-400/20 px-2 text-[0.75em] font-bold transition-opacity hover:brightness-125 {isKanaInput
						? ''
						: 'opacity-30 hover:opacity-50'}"
					title="Toggle Hiragana/Katakana input">かナ</button
				>
			{/snippet}
		</Input>
		{#if q.data?.kanjis?.length}
			{@const data = q.data}
			<Popover
				position="bottom"
				bind:open={showKanjiSection}
				transition={[fade, { duration: 200, easing: quintOut }]}
				class="w-9/12 text-base"
				arrowSize={12}
			>
				{#snippet ref()}
					<Button class="m-0 after:transition-all"
						>Kanji - {q.data?.kanjis!.length}</Button
					>
				{/snippet}
				<div
					id="kanjiSection"
					class="divide-y divide-inherit"
					style="font-family: sans-serif,Noto Sans CJK JP,Yu Gothic UI,system-ui"
				>
					{#each data.kanjis! as kanji}
						<section class="flex gap-2 p-2">
							<div class="text-2xl">{kanji.kanji}</div>
							<div class="flex flex-col gap-2 text-sm">
								<div class="font-bold">{kanji.meanings}</div>
								<div>{kanji.kun}</div>
								<div>{kanji.on}</div>
							</div>
						</section>
					{/each}
				</div>
			</Popover>
		{/if}
	</div>

	{#if q.isLoading}
		<Spinner />
	{:else if q.isError}
		<span class="font-bold text-red-400">{q.error!.message}</span>
		<span class="text-center text-2xl font-bold text-red-400"> ¯\_(ツ)_/¯</span>
	{:else if q.isSuccess}
		{#each q.data!.words! as word}
			<section
				class="surface-2 card divide-y overflow-hidden text-base"
				class:hidden={!word.kanji}
			>
				<div class="gradient relative p-2 pb-0">
					<div class="text-[0.5625em] leading-none">{word.furigana}</div>
					<div class="text-lg">{word.kanji}</div>
					<div class="absolute right-2 top-0 flex h-full items-center gap-2">
						<Button
							icon
							onclick={() => {
								query = word.kanji;
								q.fetch(word.kanji);
							}}
						>
							<Icon size={20} title="Translate">
								<SendIcon alt />
							</Icon>
						</Button>
						<Button
							icon
							onclick={() => navigator.clipboard.writeText(word.kanji)}
						>
							<Icon size={20} title="Copy to clipboard">
								<CopyIcon />
							</Icon>
						</Button>
						<AudioButton size={20} text={word.kanji} srcLang="ja" />
					</div>
				</div>
				<div class="p-2">
					{#each word.entries as entry}
						<div class="text-xs font-bold">{entry.tag}</div>
						{#each entry.definitions as definition, index}
							<div>
								<span class="text-sm">{index + 1}. {definition.meaning}</span>
								<span class="text-xs text-surface-400">
									{definition.additionalInfo ?? ""}
								</span>
							</div>
						{/each}
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>
