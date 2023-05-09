<script lang="ts">
	import Input from "~/lib/components/Input.svelte";
	import Button from "~/lib/components/Button.svelte";
	import Icon from "~/lib/components/Icon.svelte";
	import CloseIcon from "~/lib/icons/CloseIcon.svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let query = "";
	export let isModal: boolean;
</script>

<div
	class="surface-2 card sticky top-0 flex items-center gap-2 p-2 shadow-none"
>
	<Input
		bind:value={query}
		autofocus
		on:input
		class="surface-3 w-auto leading-4"
	/>
	{#if isModal}
		<Button
			className="rounded-full hover:bg-brand-400/10"
			icon
			on:click={() => dispatch("close")}
		>
			<Icon size={27}><CloseIcon /></Icon>
		</Button>
	{/if}
</div>
