<script context="module" lang="ts">
	import { writableStore } from "~/lib/utils";

	export const isScrollThumbHold = writableStore(false);
</script>

<script lang="ts">
	import { pick } from "lodash-es";

	import { onMount } from "svelte";
	import { isContentScript } from "../utils";
	import { runtime } from "webextension-polyfill";

	export let containerClasses = "";

	const isFirefox = getBrowser() === "firefox";

	let container: HTMLDivElement;
	let scrollThumb: HTMLDivElement;
	let thumbHeight = 0;
	let thumbTop = 0;
	let isScrollbarHover = false;
	let isThumbHold = false;
	let thumbPageY = 0;
	let ctrStartScrollTop = 0;
	let ctrScrollTop = 0;
	let htmlStyles: { cursor: string; pointerEvents: string; userSelect: string };

	$: toggleCursorStyles(isThumbHold);
	$: isScrollThumbHold.set(isThumbHold);

	function toggleCursorStyles(cond: boolean) {
		if (!isContentScript()) {
			return document.body.classList.toggle("reset-cursor", cond);
		}

		const html = document.documentElement;
		!htmlStyles &&
			(htmlStyles = pick(html.style, [
				"cursor",
				"pointerEvents",
				"userSelect",
			]));

		if (cond) {
			html.style.setProperty("cursor", "default", "important");
			html.style.setProperty("pointer-events", "none", "important");
			html.style.setProperty("user-select", "none", "important");
			return;
		}

		Object.assign(html.style, {
			cursor: htmlStyles?.cursor,
			pointerEvents: htmlStyles?.pointerEvents,
			userSelect: htmlStyles?.userSelect,
		});
	}

	onMount(() => {
		if (isFirefox) return;
		let resizeObserver = new ResizeObserver(resizeThumb);
		let mutationObserver = new MutationObserver((mutationList) => {
			let addedElements = [];
			let removedElements = [];
			for (const mut of mutationList) {
				addedElements.push(
					...[].filter.call(
						mut.addedNodes,
						(node) => node instanceof HTMLElement
					)
				);
				removedElements.push(
					...[].filter.call(
						mut.removedNodes,
						(node) => node instanceof HTMLElement
					)
				);
			}
			removedElements.forEach((el) => resizeObserver.unobserve(el));
			addedElements.forEach((el) =>
				resizeObserver.observe(el, { box: "border-box" })
			);
			resizeThumb();
		});

		mutationObserver.observe(container, { childList: true });

		for (const child of Array.from(container.children)) {
			resizeObserver.observe(child, { box: "border-box" });
		}

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	});

	function resizeThumb() {
		const { scrollHeight, clientHeight } = container;
		if (clientHeight === scrollHeight) {
			thumbHeight = 0;
			return;
		}
		thumbHeight = (clientHeight / scrollHeight) * clientHeight;
		handleScroll();
	}

	function handleScroll() {
		thumbTop = (container.scrollTop / container.scrollHeight) * 100;
		ctrScrollTop = container.scrollTop;
	}

	function handleThumbMouseDown(e: MouseEvent) {
		isThumbHold = true;
		thumbPageY = e.pageY;
		ctrStartScrollTop = container.scrollTop;
	}

	let isTrackThrottle = false;
	function handleScrollbarClick(e: MouseEvent) {
		if (isTrackThrottle) return;

		const evtOffsetY = e.clientY - container.getBoundingClientRect().top;

		if (
			evtOffsetY > scrollThumb.offsetTop &&
			evtOffsetY < scrollThumb.offsetTop + thumbHeight
		)
			return;

		isTrackThrottle = true;
		container.scrollBy({
			top:
				(evtOffsetY > scrollThumb.offsetTop ? 1 : -1) * container.clientHeight,
			behavior: "smooth",
		});
		setTimeout(() => {
			isTrackThrottle = false;
			handleScrollbarClick(e);
		}, 300);
	}

	function handleWindowMouseup(_e: MouseEvent) {
		if (isThumbHold) isThumbHold = false;
	}

	function handleWindowMouseMove(e: MouseEvent) {
		if (!isThumbHold) return;

		const ctrRect = container.getBoundingClientRect();
		if (
			e.pageY < ctrRect.top + window.scrollY ||
			e.pageY > ctrRect.bottom + window.scrollY
		)
			return;

		const scrollBy =
			ctrStartScrollTop +
			(container.scrollHeight / container.clientHeight) *
				(e.pageY - thumbPageY);
		container.scrollTop = scrollBy;
	}

	function getBrowser(): "firefox" | "chrome" {
		if (runtime.getURL("").startsWith("moz")) return "firefox";
		return "chrome";
	}
</script>

<svelte:window
	on:mouseup={(e) => !isFirefox && handleWindowMouseup(e)}
	on:mousemove={(e) => !isFirefox && handleWindowMouseMove(e)}
/>

{#if isFirefox}
	<div
		data-scrollbar
		data-scrollbar-content
		class="scrollbar h-full overflow-auto overscroll-contain {$$props.class} {containerClasses}"
	>
		<slot />
	</div>
{:else}
	<div data-scrollbar class="relative h-full {$$props.class}">
		<div
			bind:this={container}
			data-scrollbar-content
			class="hide-scrollbar h-full overflow-auto overscroll-contain {containerClasses}"
			on:scroll={handleScroll}
		>
			<slot />
		</div>
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		{#if thumbHeight > 0}
			<div
				data-scrollbar-track
				on:mousedown={handleScrollbarClick}
				on:mouseover={() => (isScrollbarHover = true)}
				on:mouseleave={() => (isScrollbarHover = false)}
				class="absolute right-0 top-0 z-[99] h-full w-3 rounded-md"
			>
				<div
					class="absolute right-0 h-full shadow-surface-500/40 {isScrollbarHover ||
					isThumbHold
						? 'w-full bg-white dark:bg-black'
						: 'w-1/2'}"
					class:shadow-inner={isScrollbarHover || isThumbHold}
				>
					<div
						data-scrollbar-thumb
						bind:this={scrollThumb}
						on:mousedown={handleThumbMouseDown}
						class="relative h-1 scale-y-95 [&>*]:bg-brand-300 [&>*]:hover:bg-brand-400 [&>*]:active:bg-brand-600"
						style="height: {thumbHeight}px; top: {thumbTop}%;"
					>
						<div class="mx-auto h-full w-1/2 rounded-md" />
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style lang="postcss" global>
	.reset-cursor {
		cursor: default !important;
		pointer-events: none !important;
		user-select: none !important;
	}
	.hide-scrollbar {
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}
</style>
