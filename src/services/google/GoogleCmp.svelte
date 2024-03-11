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
			translateAfterSwitch: true,
			persistLanguage: true,
		},
	});
</script>

<script lang="ts">
	import {
		AudioButton,
		Button,
		Icon,
		PosSection,
		Select,
		Spinner,
		TextArea,
		WithIcons,
		MasonryGrid,
	} from "~/lib/components";
	import { ChevronIcon, CloseIcon, CopyIcon, SendIcon } from "~/lib/icons";

	import type { GoogleTranslateResponse } from "./types";
	import { Query } from "~/lib/query.svelte";
	import { httpRequest, ttsPlay } from "~/lib/utils";
	import { registerKeymaps } from "~/lib/keymapps";
	import { supportedLanguages as langs } from "./supportedLanguages";
	import type { ServiceProps } from "../types";

	import { isJapanese } from "wanakana";
	import { slide } from "svelte/transition";

	let { query, onclear } = $props<ServiceProps>();
	export function showResult(he: GoogleTranslateResponse) {
		if (!he) return q.setState("initial");
		q.setState("success", he);
	}
	export function translate(query: string) {
		query = query.trim();
		if (!query) return;
		q.fetch(query);
	}

	const q = new Query(name, _translate);

	let showDefinition = $state(false);
	let _langs: { srcLang?: string; targetLang?: string } = {};

	async function _translate(
		query: string,
		sl = _langs.srcLang || store.val.srcLang,
		tl = _langs.targetLang || store.val.targetLang,
	) {
		if (!query.trim()) throw new Error("Query is empty");
		const isFromJapanese =
			sl === "auto" && store.val.settings.preferJapanese && isJapanese(query);
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
			`https://translate.googleapis.com/translate_a/single?${searchParams}`,
		);
		result.srcLang = result.src;
		result.targetLang = tl;

		return { result, keys: [query, isFromJapanese ? "ja" : sl, tl] };
	}

	async function handleKeyDown(e: KeyboardEvent) {
		if ("__root" in e) return;
		if (e.shiftKey && e.key === "Enter") return;
		if (e.key !== "Enter") return;
		if (!query.trim().length) return;

		e.preventDefault();

		q.fetch(query.trim());
	}

	async function reverseTranslation() {
		if (!q.data?.src && !q.data?.sentences?.[0]?.trans) {
			let _srcLang = store.val.srcLang;
			if (_srcLang === "auto") _srcLang = store.val.recentLangs[1];
			store.val.srcLang = store.val.targetLang;
			store.val.targetLang = _srcLang;
			return;
		}

		const sourceLang = q.data.src;
		query = q.data.sentences[0].trans!;
		q.fetch(query, q.data.targetLang, sourceLang);
	}

	function handleLanguageChange(e: { id?: string; value: any }) {
		const { id, value } = e;
		_langs[id as keyof typeof _langs] = value;
		if (!store.val.recentLangs.includes(value)) {
			store.val.recentLangs.push(value);
		}

		if (!q.data) {
			console.log("handleLanguageChange", _langs);
			_langs.srcLang = _langs.targetLang = undefined;
			store.val[id as keyof typeof _langs] = value;
			return;
		}

		q.setState("success", { ...q.data, [id!]: value });

		if (store.val.settings.persistLanguage) {
			store.val[id as keyof typeof _langs] = value;
		}
		if (!store.val.settings.translateAfterSwitch) return;

		q.fetch(query);
	}

	function onClear() {
		query = "";
		q.setState("initial");
		_langs = {};
		onclear?.();
	}

	const handleWindowKeydown = registerKeymaps(
		{
			d: [
				"showDefinition",
				() => {
					if (!q.data) return;
					showDefinition = !showDefinition;
				},
			],
			p: [
				"playSource",
				() => {
					if (!q.data) return;
					ttsPlay(query, q.data.src);
				},
			],
			"s-p": [
				"playTarget",
				() => {
					if (!q.data?.sentences?.[0]?.trans) return;
					ttsPlay(q.data.sentences[0].trans, store.val.targetLang);
				},
			],
		},
		{ group: name },
	);
</script>

<svelte:window onkeydowncapture={handleWindowKeydown} />

<div class="mb-2 flex items-center justify-evenly gap-2">
	<Select
		class="w-1/2"
		value={q.data?.srcLang || store.val.srcLang}
		onchange={handleLanguageChange}
		id="srcLang"
		items={{
			"Recent languages": langs.reduce((res, lang) => {
				if (!store.val.recentLangs.includes(lang.code)) return res;
				res.push({ text: lang.name, value: lang.code });
				return res;
			}, [] as {text:string,value:string}[]),
			"All languages": langs.map((lang) => ({
				text: lang.name,
				value: lang.code,
			})),
		}}
	/>
	<Button icon class="group" onclick={reverseTranslation}>
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
		value={q.data?.targetLang || store.val.targetLang}
		onchange={handleLanguageChange}
		id="targetLang"
		items={{
			"Recent languages": langs.reduce((res, lang) => {
				if (lang.code === "auto" || !store.val.recentLangs.includes(lang.code))
					return res;
				res.push({ text: lang.name, value: lang.code });
				return res;
			}, [] as {text:string,value:string}[]),
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
			onkeydown={handleKeyDown}
		/>
		{#snippet right()}
			<div class="flex flex-col items-end justify-between gap-2 p-2">
				{#if query.length > 0}
					<Button icon onclick={onClear}>
						<Icon title="Clear input field">
							<CloseIcon variant="outline" />
						</Icon>
					</Button>
				{/if}
				<div class="inline-flex gap-2">
					{#if q.data?.src && query.length < 200}
						<AudioButton text={query} srcLang={q.data.src} />
					{/if}
					{#if query.length > 0}
						<Button icon onclick={() => q.fetch(query)}>
							<Icon title="Translate">
								<SendIcon />
							</Icon>
						</Button>
					{/if}
				</div>
			</div>
		{/snippet}
	</WithIcons>
	{#if q.data?.sentences?.[0]?.trans}
		<section
			class="surface-2 card grid grid-cols-[1fr,auto] bg-gradient-to-br from-brand-400/20 p-2 font-bold dark:from-brand-700/20"
		>
			<div>
				<p class="mb-1">{q.data.sentences[0].trans}</p>
				{#if q.data.sentences.at(-1)?.src_translit}
					<div class="text-xs font-normal text-surface-500">
						{q.data.sentences.at(-1)?.src_translit}
					</div>
				{/if}
			</div>
			<div class="flex flex-col gap-2">
				<AudioButton
					text={q.data.sentences[0].trans}
					srcLang={q.data.targetLang}
				/>
				<Button
					icon
					onclick={() =>
						navigator.clipboard.writeText(q.data?.sentences[0].trans!)}
				>
					<Icon title="Copy to clipboard">
						<CopyIcon />
					</Icon>
				</Button>
			</div>
		</section>
	{/if}
</div>

{#if q.data}
	<MasonryGrid
		autoResize={true}
		observeChildren={true}
		useResizeObserver={true}
		column={2}
		align="stretch"
		gap={8}
		deps={q.data}
	>
		{#if q.data.dict}
			{#each q.data.dict as dict (dict.pos)}
				<PosSection
					onreverseTranslation={(e) => {
						query = e;
						q.fetch(e);
					}}
					pos={dict.pos}
					words={dict.entry}
				/>
			{/each}
		{/if}
		{#if q.data.definitions}
			<section class="surface-2 card text-base">
				<button
					class="flex w-full items-center justify-between p-2 text-sm font-bold {showDefinition
						? 'border-b border-b-surface-100 pb-2 dark:border-b-surface-700'
						: ''}"
					onclick={() => (showDefinition = !showDefinition)}
				>
					Definitions - {q.data.definitions.length}
					<Icon>
						<ChevronIcon
							class="transition-transform"
							dir={showDefinition ? "down" : "up"}
						/>
					</Icon>
				</button>
				{#if showDefinition}
					<dl class="grid gap-1 p-2" transition:slide={{ duration: 200 }}>
						{#each q.data.definitions as def (def.pos)}
							<dt class="text-[0.8125em] font-bold">{def.pos}</dt>
							{#each def.entry as definition, i (definition.definition_id)}
								<dd class="text-xs">{i + 1}. {definition.gloss}</dd>
							{/each}
						{/each}
					</dl>
				{/if}
			</section>
		{/if}
	</MasonryGrid>
{:else if q.isError}
	<div class="font-bold text-red-400">{q.error!.message}</div>
	<div class="text-center text-2xl font-bold text-red-400">¯\_(ツ)_/¯</div>
{:else if q.isLoading}
	<Spinner />
{/if}
