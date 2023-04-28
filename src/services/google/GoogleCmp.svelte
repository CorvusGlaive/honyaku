<script lang="ts" context="module">
	import { initService } from "../utils";

	const { name, store } = initService({
		name: "google",
		color: "blue",
		store: {
			srcLang: "auto",
			targetLang: "ru",
			recentLangs: ["auto", "ru"],
		},
		settings: {
			preferJapanese: true,
		},
	});
</script>

<script lang="ts">
	import AudioButton from "~/lib/components/AudioButton.svelte";
	import PosSection from "~/lib/components/PosSection.svelte";
	import TextArea from "~/lib/components/TextArea.svelte";
	import Select from "~/lib/components/Select.svelte";
	import Icon from "~/lib/components/Icon.svelte";
	import Spinner from "~/lib/components/Spinner.svelte";
	import { MasonryGrid } from "@egjs/svelte-grid";

	import { supportedLanguages as langs } from "./supportedLanguages";
	import type { GoogleTranslateResponse } from "./types";
	import { httpRequest, ttsPlay } from "~/lib/utils";
	import { registerKeymaps } from "~/lib/keymapps";
	import { Query } from "~/lib/query";
	import { union } from "lodash-es";
	import { createEventDispatcher, type ComponentEvents } from "svelte";
	import { isJapanese } from "wanakana";
	import CloseIcon from "~/lib/icons/CloseIcon.svelte";
	import SendIcon from "~/lib/icons/SendIcon.svelte";
	import ChevronIcon from "~/lib/icons/ChevronIcon.svelte";
	import CopyIcon from "~/lib/icons/CopyIcon.svelte";
	import Button from "~/lib/components/Button.svelte";
	import WithIcons from "~/lib/components/WithIcons.svelte";
	import { slide } from "svelte/transition";

	export let query: string;
	export function showResult(he: GoogleTranslateResponse) {
		if (!he) return $q.setState("initial");
		$q.setState("success", he);
	}

	const dispatch = createEventDispatcher();
	const q = new Query(name, translate);

	let showDefinition = false;

	async function translate(
		query: string,
		sl = $store.srcLang,
		tl = $store.targetLang
	): Promise<{ result: GoogleTranslateResponse; keys: string[] }> {
		const isFromJapanese =
			sl === "auto" && $store.settings.preferJapanese && isJapanese(query);
		const searchParams = new URLSearchParams([
			["client", "gtx"],
			["dt", "t"],
			["dt", "bd"],
			["dt", "qc"],
			["dt", "rm"],
			["dt", "ld"],
			["dt", "md"],
			["dt", "rw"],
			["dt", "sw"],
			["dj", "1"],
			["hl", "en"],
			["tk", "727849.727849"],
			["sl", isFromJapanese ? "ja" : sl],
			["tl", tl],
			["q", query],
		]);

		const result = await httpRequest(
			`https://translate.googleapis.com/translate_a/single?${searchParams}`
		);
		result.srcLang = result.src;
		result.targetLang = tl;

		return { result, keys: [query, isFromJapanese ? "ja" : sl, tl] };
	}

	async function handleKeyDown(
		e: KeyboardEvent & { target: HTMLTextAreaElement }
	) {
		if (e.shiftKey && e.key === "Enter") return;
		if (e.key !== "Enter") return;
		if (!query.trim().length) return;

		e.preventDefault();

		$q.fetch(query.trim());
	}

	async function reverseTranslation() {
		if (!$q.data?.src && !$q.data?.sentences[0].trans) {
			let _srcLang = $store.srcLang;
			$store.srcLang = $store.targetLang;
			$store.targetLang = _srcLang;
			return;
		}

		const sourceLang = $q.data.src;
		query = $q.data.sentences[0].trans;
		$q.fetch(query, $q.data.targetLang, sourceLang);
	}

	async function handleLanguageChange(e: ComponentEvents<Select>["change"]) {
		const { id, value } = e.detail;
		$store[id] = value;
		$store.recentLangs = union($store.recentLangs, [value]);

		if (!$q.data) return;

		$q.fetch(query);
	}

	const handleWindowKeydown = registerKeymaps(
		{
			d: [
				"showDefinition",
				() => {
					if (!$q.data) return;
					showDefinition = !showDefinition;
				},
			],
			p: [
				"playSource",
				() => {
					if (!$q.data) return;
					ttsPlay(query, $q.data.src);
				},
			],
			"s-p": [
				"playTarget",
				() => {
					if (!$q.data?.sentences?.[0]?.trans) return;
					ttsPlay($q.data.sentences[0].trans, $store.targetLang);
				},
			],
		},
		{ group: name as string }
	);
</script>

<svelte:window on:keydown|capture={handleWindowKeydown} />

<div class="mb-2 flex items-center justify-evenly gap-2">
	<Select
		class="w-1/2"
		value={$q.data?.srcLang || $store.srcLang}
		on:change={handleLanguageChange}
		id="srcLang"
		items={{
			"Recent languages": langs.reduce((res, lang) => {
				if (!$store.recentLangs.includes(lang.code)) return res;
				res.push({ text: lang.name, value: lang.code });
				return res;
			}, []),
			"All languages": langs.map((lang) => ({
				text: lang.name,
				value: lang.code,
			})),
		}}
	/>
	<Button icon className="group" on:click={reverseTranslation}>
		<Icon size={24} title="Reverse translation">
			<path
				class="transition-transform ease-in-out group-hover:translate-x-1"
				d="M28 10L22 4 20.59 5.41 24.17 9 4 9 4 11 24.17 11 20.59 14.59 22 16 28 10z"
			/>
			<path
				class="transition-transform ease-in-out group-hover:-translate-x-1"
				d="M11.41 26.59L7.83 23 28 23 28 21 7.83 21 11.41 17.41 10 16 4 22 10 28 11.41 26.59z"
			/>
		</Icon>
	</Button>
	<Select
		class="w-1/2"
		value={$q.data?.targetLang || $store.targetLang}
		on:change={handleLanguageChange}
		id="targetLang"
		items={{
			"Recent languages": langs.reduce((res, lang) => {
				if (lang.code === "auto" || !$store.recentLangs.includes(lang.code))
					return res;
				res.push({ text: lang.name, value: lang.code });
				return res;
			}, []),
			"All languages": langs
				.slice(1)
				.map((lang) => ({ text: lang.name, value: lang.code })),
		}}
	/>
</div>

<div class="mb-2 grid items-start gap-2">
	<WithIcons tag="section">
		<TextArea
			isMainInput={true}
			class="min-h-[4em]"
			autofocus
			bind:value={query}
			on:keydown={handleKeyDown}
		/>
		<div slot="right" class="flex flex-col items-end justify-between gap-2 p-2">
			{#if query.length > 0}
				<Button
					icon
					on:click={() => {
						query = "";
						$q.setState("initial");
						dispatch("clear");
					}}
				>
					<Icon title="Clear input field">
						<CloseIcon variant="outline" />
					</Icon>
				</Button>
			{/if}
			<div class="inline-flex gap-2">
				{#if $q.data?.src && query.length < 200}
					<AudioButton text={query} srcLang={$q.data.src} />
				{/if}
				{#if query.length > 0}
					<Button icon on:click={() => $q.fetch(query)}>
						<Icon title="Translate">
							<SendIcon />
						</Icon>
					</Button>
				{/if}
			</div>
		</div>
	</WithIcons>
	{#if $q.data?.sentences[0].trans}
		<section
			class="surface-2 card grid grid-cols-[1fr,auto] bg-gradient-to-br from-brand-400/20 p-2 font-bold dark:from-brand-700/20"
		>
			<div>
				<p class="mb-1">{$q.data.sentences[0].trans}</p>
				{#if $q.data?.sentences.at(-1).src_translit}
					<div class="text-xs font-normal text-surface-500">
						{$q.data.sentences.at(-1).src_translit}
					</div>
				{/if}
			</div>
			<div class="flex flex-col gap-2">
				<AudioButton
					text={$q.data.sentences[0].trans}
					srcLang={$q.data.targetLang}
				/>
				<Button
					icon
					on:click={() =>
						navigator.clipboard.writeText($q.data.sentences[0].trans)}
				>
					<Icon title="Copy to clipboard">
						<CopyIcon />
					</Icon>
				</Button>
			</div>
		</section>
	{/if}
</div>

{#if $q.data}
	<MasonryGrid
		observeChildren={true}
		useResizeObserver={true}
		column={2}
		align="stretch"
		gap={8}
	>
		<!-- <div class="grid gap-2"> -->
		{#if $q.data.dict}
			{#each $q.data.dict as dict (dict.pos)}
				<PosSection
					on:reverseTranslation={async (e) => {
						query = e.detail;
						$q.fetch(e.detail);
					}}
					pos={dict.pos}
					words={dict.entry}
				/>
			{/each}
		{/if}
		{#if $q.data.definitions}
			<section class="surface-2 card text-base">
				<button
					class="flex w-full items-center justify-between p-2 text-sm font-bold {showDefinition
						? 'border-b border-b-surface-100 pb-2 dark:border-b-surface-700'
						: ''}"
					on:click={() => (showDefinition = !showDefinition)}
				>
					Definitions - {$q.data.definitions.length}
					<Icon>
						<ChevronIcon
							class="transition-transform"
							dir={showDefinition ? "down" : "up"}
						/>
					</Icon>
				</button>
				{#if showDefinition}
					<dl class="grid gap-1 p-2" transition:slide={{ duration: 200 }}>
						{#each $q.data.definitions as def (def.pos)}
							<dt class="text-[0.8125em] font-bold">{def.pos}</dt>
							{#each def.entry as definition, i (definition.definition_id)}
								<dd class="text-xs">{i + 1}. {definition.gloss}</dd>
							{/each}
						{/each}
					</dl>
				{/if}
			</section>
		{/if}
		<!-- </div> -->
	</MasonryGrid>
{:else if $q.isLoading}
	<Spinner />
{/if}
