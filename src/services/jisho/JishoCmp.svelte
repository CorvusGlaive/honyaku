<script lang="ts" context="module">
	import { initService } from "../utils";

	const { name } = initService({
		name: "jisho",
		color: "emerald",
	});
</script>

<script lang="ts">
	import AudioButton from "~/lib/components/AudioButton.svelte";
	import Button from "~/lib/components/Button.svelte";
	import CopyIcon from "~/lib/icons/CopyIcon.svelte";
	import Icon from "~/lib/components/Icon.svelte";
	import Input from "~/lib/components/Input.svelte";
	import Popover from "~/lib/components/Popover.svelte";
	import SendIcon from "~/lib/icons/SendIcon.svelte";
	import Spinner from "~/lib/components/Spinner.svelte";

	import type { JishoResponse } from "./types";
	import { parseDom } from "./utils";
	import { Query } from "~/lib/query";
	import { httpRequest } from "~/lib/utils";
	import { registerKeymaps } from "~/lib/keymapps";

	import { bind, unbind } from "wanakana";
	import { createEventDispatcher } from "svelte";
	import { fade } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	export let query: string;
	export function showResult(he: JishoResponse) {
		if (!he) return $q.setState("initial");
		$q.setState("success", he);
	}
	export function translate(query: string) {
		query = query.trim();
		if (!query) return;
		$q.fetch(query);
	}

	const q = new Query(name, _translate);
	const dispatch = createEventDispatcher();

	let showKanjiSection = false;
	let kanjiButtonRef: HTMLButtonElement;
	let isKanaInput = false;
	let inputEl: HTMLInputElement;

	$: bindInput(inputEl, isKanaInput);
	function bindInput(input: HTMLInputElement, isOn: boolean) {
		if (!input) return;
		if (isOn) return bind(input);
		try {
			unbind(input);
		} catch {}
	}

	async function _translate(query: string) {
		query.trim();
		if (!query) return;

		let page: string | Document;

		page = await httpRequest(
			"https://jisho.org/search/" + encodeURIComponent(query),
			{ resMethod: "text" }
		);
		page = new DOMParser().parseFromString(page as string, "text/html");
		let result = parseDom(page);

		return { result, keys: [query] };
	}

	function handleKeyDown(e: KeyboardEvent & { target: HTMLInputElement }) {
		if (e.key !== "Enter") return;
		if (!e.target.value) return;
		e.preventDefault();
		$q.fetch(e.target.value);
	}

	const handleWindowKeydown = registerKeymaps(
		{
			"s-k": ["showKanjiSection", () => (showKanjiSection = !showKanjiSection)],
			"i-c-k": [
				"toggleKanaInput",
				(e) => (e.preventDefault(), (isKanaInput = !isKanaInput)),
			],
		},
		{ group: name as string }
	);
</script>

<svelte:window on:keydown|capture={handleWindowKeydown} />

<div class="relative flex flex-col gap-2">
	<div
		class="grid"
		class:gap-1={$q.data?.kanjis?.length}
		style="grid-template-columns: 1fr max-content;"
	>
		<Input
			type="search"
			bind:ref={inputEl}
			bind:value={query}
			isMainInput={true}
			autofocus
			on:keydown={handleKeyDown}
			on:clear={() => {
				query = "";
				$q.setState("initial");
				dispatch("clear");
			}}
			on:send={() => $q.fetch(query)}
		>
			<button
				slot="left"
				on:click={() => (isKanaInput = !isKanaInput)}
				class="whitespace-nowrap border-r border-r-surface-500/10 bg-gray-400/20 px-2 text-[0.75em] font-bold transition-opacity hover:brightness-125 {isKanaInput
					? ''
					: 'opacity-30 hover:opacity-50'}"
				title="Toggle Hiragana/Katakana input">かナ</button
			>
		</Input>
		{#if $q.data?.kanjis?.length}
			{@const data = $q.data}
			<Popover
				position="bottom"
				bind:open={showKanjiSection}
				transition={[fade, { duration: 200, easing: quintOut }]}
				class="w-9/12 text-base"
				arrowSize={12}
			>
				<Button
					slot="ref"
					bind:ref={kanjiButtonRef}
					className="m-0 after:transition-all"
					>Kanji - {$q.data?.kanjis.length}</Button
				>
				<div
					id="kanjiSection"
					class="divide-y divide-inherit"
					style="font-family: sans-serif,Noto Sans CJK JP,Yu Gothic UI,system-ui"
				>
					{#each data.kanjis as kanji}
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

	{#if $q.isLoading}
		<Spinner />
	{:else if $q.isError}
		<span class="text-lg font-bold text-red-400"> ¯\_(ツ)_/¯</span>
	{:else if $q.isSuccess}
		{@const data = $q.data}
		{#each data.words as word}
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
							on:click={() => {
								query = word.kanji;
								$q.fetch(word.kanji);
							}}
						>
							<Icon size={20} title="Translate">
								<SendIcon alt />
							</Icon>
						</Button>
						<Button
							icon
							on:click={() => navigator.clipboard.writeText(word.kanji)}
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
