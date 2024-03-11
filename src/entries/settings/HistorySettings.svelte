<script lang="ts">
	import TranslationServices from "~/services/TranslationServices.svelte";
	import History from "~/lib/history";

	let contentHeight = $state(0);
	let contentEl: HTMLElement;
	let showResult: (arg: any) => any;

	$effect(() => {
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
			<History isModal={false} onselect={(e) => showResult(e)} />
		</section>
		<section
			bind:this={contentEl}
			class="top-2 self-start"
			class:sticky={contentHeight < visualViewport!.height}
		>
			<TranslationServices bind:showResult />
		</section>
	</div>
</template>
