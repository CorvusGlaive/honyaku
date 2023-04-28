<script lang="ts">
	import Router, { replace, location } from "svelte-spa-router";
	import active from "svelte-spa-router/active";
	import "~/lib/index.css";
	import HistorySettings from "./HistorySettings.svelte";
	import Services from "./Services.svelte";
	import Shortcuts from "./shortcuts/Shortcuts.svelte";
	import { initAppearance, Appearance } from "./appearance";
	import TextLogo from "~/lib/components/TextLogo.svelte";

	initAppearance();

	$: $location === "/" && replace("/appearance");

	const routes = {
		"/appearance": Appearance,
		"/services": Services,
		"/shortcuts": Shortcuts,
		"/history": HistorySettings,
	};
</script>

<main class="surface-2 card flex min-h-screen flex-col rounded-none">
	<header
		class="gradient flex items-center gap-1 border-b border-surface-100 p-2 text-2xl font-bold dark:border-surface-700"
	>
		<img alt="logo" class="h-[2em] w-[2em]" src="/icons/cherry.svg" />
		<TextLogo className="w-[5em] opacity-90" />
		<span class="opacity-50">—</span>
		<span>Settings</span>
	</header>
	<div class="grid flex-1 grid-cols-[0.25fr_1fr]">
		<nav class=" border-r border-surface-100 dark:border-surface-700">
			<div class="sticky top-0 flex flex-col gap-2 p-2">
				{#each Object.entries(routes) as [route]}
					<a
						href="#{route}"
						class="rounded-md p-2 capitalize hover:bg-surface-300/20 [&.active]:bg-brand-400/20 [&.active]:text-brand-700 [&.active]:dark:text-brand-300"
						use:active>{route.substring(1)}</a
					>
				{/each}
			</div>
		</nav>
		<div class="flex flex-col gap-4 bg-surface-50 p-4 dark:bg-surface-900">
			<Router {routes} />
		</div>
	</div>
</main>
