<script lang="ts">
	import Icon from "./Icon.svelte";
	import Popover from "./Popover.svelte";

	interface Props {
		pos: string;
		words: any[];
		onreverseTranslation: (word: string) => void;
	}
	let { pos = "", words = [], onreverseTranslation } = $props<Props>();

	let bgClasses = $state("");
	let ringColor = $state("");

	$effect(() => {
		switch (pos) {
			case "noun":
				bgClasses = "bg-blue-50 dark:bg-blue-900";
				ringColor = "ring-blue-300";
				break;
			case "verb":
				bgClasses = "bg-purple-50 dark:bg-purple-900";
				ringColor = "ring-purple-300";
				break;
			case "adjective":
				bgClasses = "bg-orange-50 dark:bg-orange-900";
				ringColor = "ring-orange-300";
				break;
			case "adverb":
				bgClasses = "bg-emerald-50 dark:bg-emerald-900";
				ringColor = "ring-emerald-300";
				break;
			case "pronoun":
				bgClasses = "bg-rose-50 dark:bg-rose-900";
				ringColor = "ring-rose-300";
				break;
			case "other":
			default:
				bgClasses = "bg-gray-50 dark:bg-gray-900";
				ringColor = "ring-gray-300";
				break;
		}
	});
</script>

<div class="relative {bgClasses} ring-2 ring-inset {ringColor} rounded-md">
	<Popover trigger="hover" position="bottom" class="p-2">
		{#snippet ref()}
			<Icon
				class="absolute right-1 top-1 cursor-pointer opacity-10 hover:opacity-50"
			>
				<path
					d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"
				/><circle cx="16" cy="23.5" r="1.5" /><path
					d="M17,8H15.5A4.49,4.49,0,0,0,11,12.5V13h2v-.5A2.5,2.5,0,0,1,15.5,10H17a2.5,2.5,0,0,1,0,5H15v4.5h2V17a4.5,4.5,0,0,0,0-9Z"
				/>
			</Icon>
		{/snippet}
		<span>{pos}</span>
	</Popover>
	<div class="flex flex-wrap items-baseline p-2">
		{#each words as word}
			<div class="basis-full text-xs font-bold">{word.word}</div>
			<ul class="text-xs text-neutral-600 dark:text-white/60">
				{#each word.reverse_translation as rev, i}
					<li class="inline">
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span
							role="button"
							tabindex="0"
							class="cursor-pointer hover:underline"
							onclick={() => onreverseTranslation(rev)}>{rev}</span
						>{i === word.reverse_translation.length - 1 ? "" : ", "}
					</li>
				{/each}
			</ul>
		{/each}
	</div>
</div>
