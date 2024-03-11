<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		title?: string;
		class?: string;
		containerClass?: string;
		children: Snippet;
	}
	let {
		title = "",
		class: className = "",
		containerClass = "",
		children,
	} = $props<Props>();
</script>

<section class="mb-4 last:mb-0 {className}">
	{#if title}
		<div class="mb-2 text-base font-bold capitalize">{title}</div>
	{/if}
	<div class="ml-2 {containerClass || ''}">
		{@render children()}
	</div>
</section>
