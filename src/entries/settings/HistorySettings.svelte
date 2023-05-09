<script lang="ts">
	import TranslationServices from "~/services/TranslationServices.svelte";
	import History from "~/lib/history";
	import { onMount } from "svelte";

	let selectedText = "";
	let contentEl: HTMLElement;
	let contentHeight = 0;
	let showResult: (arg: any) => any;

	onMount(() => {
		const resizeObsrv = new ResizeObserver((v) => {
			contentHeight = v[0].contentRect.height;
		});
		resizeObsrv.observe(contentEl);
		return () => resizeObsrv.disconnect();
	});
</script>

<template>
	<div class="grid grid-cols-2 gap-3">
		<section>
			<History isModal={false} on:select={(e) => showResult(e.detail)} />
		</section>
		<section
			bind:this={contentEl}
			class="top-2 self-start"
			class:sticky={contentHeight < visualViewport.height}
		>
			<TranslationServices bind:showResult {selectedText} />
		</section>
	</div>
</template>
