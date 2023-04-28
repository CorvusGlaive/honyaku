<script lang="ts">
	export let title = "";
	export let containerClass = "";
</script>

<section class="mb-4 last:mb-0 {$$props.class ? $$props.class : ''}">
	{#if title}
		<div class="mb-2 text-base font-bold capitalize">{title}</div>
	{/if}
	<div class="ml-2 {containerClass || ''}">
		<slot />
	</div>
</section>
