<script lang="ts">
	import TranslationServices from "~/services/TranslationServices.svelte";
	import History from "~/lib/components/History.svelte";
	import { onMount } from "svelte";

	let selectedText = "";
	let historySection: HTMLElement;
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
	<History
		target={historySection}
		isModal={false}
		on:select={(e) => showResult(e.detail)}
	/>

	<div class="grid grid-cols-2 gap-3">
		<section bind:this={historySection} />
		<section
			bind:this={contentEl}
			class="top-2 self-start"
			class:sticky={contentHeight < visualViewport.height}
		>
			<TranslationServices bind:showResult {selectedText} />
		</section>
	</div>
</template>
