<script context="module" lang="ts">
	let _isScrollThumbHold = $state(false);
	export let isScrollThumbHold = () => _isScrollThumbHold;
</script>

<script lang="ts">
	import { isContentScript } from "../utils";
	import { runtime } from "webextension-polyfill";
	import type { Snippet } from "svelte";

	interface Props {
		containerClasses?: string;
		class?: string;
		scrollTop?: number;
		children: Snippet;
	}
	let {
		containerClasses = "",
		class: className = "",
		scrollTop,
		children,
	} = $props<Props>();

	const isFirefox = getBrowser() === "firefox";

	let container: HTMLDivElement;
	let scrollThumb: HTMLDivElement;
	let thumbHeight = $state(0);
	let thumbTop = $state(0);
	let isScrollbarHover = $state(false);
	let isThumbHold = $state(false);
	let thumbPageY = 0;
	let ctrStartScrollTop = 0;
	let htmlStyles: { cursor: string; pointerEvents: string; userSelect: string };

	$effect(() => {
		if (scrollTop !== undefined) container.scrollTop = scrollTop;
	});
	$effect(() => {
		toggleCursorStyles(isThumbHold);
		_isScrollThumbHold = isThumbHold;
	});

	function toggleCursorStyles(cond: boolean) {
		if (!isContentScript()) {
			return document.body.classList.toggle("reset-cursor", cond);
		}

		const html = document.documentElement;
		if (!htmlStyles) {
			htmlStyles = {
				cursor: html.style.cursor,
				pointerEvents: html.style.pointerEvents,
				userSelect: html.style.userSelect,
			};
		}

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

	$effect(() => {
		if (isFirefox) return;
		let resizeObserver = new ResizeObserver(resizeThumb);
		let mutationObserver = new MutationObserver((mutationList) => {
			let addedElements: HTMLElement[] = [];
			let removedElements: HTMLElement[] = [];
			for (const mut of mutationList) {
				addedElements.push(
					...[].filter.call(
						mut.addedNodes,
						(node) => (node as Node) instanceof HTMLElement,
					),
				);
				removedElements.push(
					...[].filter.call(
						mut.removedNodes,
						(node) => (node as Node) instanceof HTMLElement,
					),
				);
			}
			removedElements.forEach((el) => resizeObserver.unobserve(el));
			addedElements.forEach((el) =>
				resizeObserver.observe(el, { box: "border-box" }),
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
		if (!container) return;
		const { scrollHeight, clientHeight } = container;
		if (clientHeight === scrollHeight) {
			thumbHeight = 0;
			return;
		}
		thumbHeight = Math.max(
			(clientHeight / scrollHeight) * clientHeight,
			clientHeight * 0.1,
		);
		handleScroll();
	}

	function handleScroll() {
		thumbTop = (container.scrollTop / container.scrollHeight) * 100;
	}

	function handleThumbMouseDown(e: MouseEvent) {
		isThumbHold = true;
		thumbPageY = e.pageY;
		ctrStartScrollTop = container.scrollTop;
	}

	let isTrackHold = false;
	function handleScrollbarClick(e: MouseEvent) {
		if (isThumbHold) return;
		isTrackHold = true;

		const evtOffsetY = e.clientY - container.getBoundingClientRect().top;

		if (
			evtOffsetY > scrollThumb.offsetTop &&
			evtOffsetY < scrollThumb.offsetTop + thumbHeight
		)
			return;

		container.scrollBy({
			top:
				(evtOffsetY > scrollThumb.offsetTop ? 1 : -1) * container.clientHeight,
			behavior: "smooth",
		});
		setTimeout(scrollOnHold, 300, evtOffsetY);
	}

	function scrollOnHold(offsetY = 0) {
		if (!isTrackHold) return;
		const top = scrollThumb.offsetTop;
		const bot = scrollThumb.offsetTop + scrollThumb.offsetHeight;
		if (offsetY > top && offsetY < bot) return;
		let dir = offsetY > top ? 1 : -1;

		container.scrollBy({
			top: dir * container.clientHeight * 0.5,
		});

		setTimeout(scrollOnHold, 10, offsetY);
	}

	function handleWindowMouseup(_e: MouseEvent) {
		if (isThumbHold) isThumbHold = false;
		if (isTrackHold) isTrackHold = false;
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
	onmouseup={(e) => !isFirefox && handleWindowMouseup(e)}
	onmousemove={(e) => !isFirefox && handleWindowMouseMove(e)}
/>

{#if isFirefox}
	<div
		data-scrollbar
		data-scrollbar-content
		class="scrollbar h-full overflow-auto overscroll-contain {className} {containerClasses}"
	>
		{@render children()}
	</div>
{:else}
	<div data-scrollbar class="relative h-full {className}">
		<div
			bind:this={container}
			data-scrollbar-content
			class="hide-scrollbar h-full overflow-auto overscroll-contain {containerClasses}"
			onscroll={handleScroll}
		>
			{@render children()}
		</div>
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		{#if thumbHeight > 0}
			<div
				data-scrollbar-track
				onmousedown={handleScrollbarClick}
				onmouseover={() => (isScrollbarHover = true)}
				onmouseleave={() => (isScrollbarHover = false)}
				class="absolute right-0 top-0 z-[99] h-full w-3 rounded-md"
			>
				<div
					class="absolute right-0 h-full shadow-surface-500/40 {isScrollbarHover ||
					isThumbHold
						? 'w-full bg-white dark:bg-black'
						: 'w-1/2'}"
				>
					<div
						data-scrollbar-thumb
						bind:this={scrollThumb}
						onmousedown={handleThumbMouseDown}
						class="relative h-1 *:bg-brand-300 *:hover:bg-brand-400 *:active:bg-brand-600"
						class:py-0.5={isScrollbarHover || isThumbHold}
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
