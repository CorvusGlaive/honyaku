<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Fuse from "fuse.js";
	import ChevronIcon from "../icons/ChevronIcon.svelte";
	import Icon from "./Icon.svelte";
	import { computePosition, size } from "@floating-ui/dom";
	import { groupBy } from "lodash-es";

	type Item = {
		groupHeader?: string;
		group?: string;
		text: string;
		value: unknown;
	};

	type Items =
		| Record<string, { text: string; value: unknown }[]>
		| Record<string, (string | number)[]>
		| (string | number)[]
		| { text: string; value: unknown }[];

	export let id: string = "";
	export let value: unknown;
	export let items: Items;

	let searchItems: Item[];
	let label = typeof value === "string" ? value : "";
	let open = false;
	let floatingEl: HTMLElement;
	let refEl: HTMLElement;
	let inputRef: HTMLInputElement;
	let selectedId = 0;
	let isSelected = true;

	const dispatch = createEventDispatcher<{
		change: { id?: string; value: any };
	}>();
	const fuse = new Fuse([], {
		keys: [
			{ name: "text", weight: 0.8 },
			{ name: "value", weight: 0.2 },
		],
	});

	$: flatItems = processItems(items);
	$: value && updateLabel(value);
	$: if (open) {
		placeDropDown(refEl, floatingEl);
		initSelection();
	}
	$: !open && onClose();
	$: searchItems && initSelection();
	$: fuse.setCollection(flatItems);
	$: availableItems = searchItems || flatItems;

	function onClose() {
		selectedId = 0;
		isSelected = true;
		inputRef?.blur();
		inputRef && (inputRef.value = label);
		searchItems = undefined;
	}

	function initSelection() {
		selectedId = availableItems?.[0]?.groupHeader ? 1 : 0;
	}

	function placeDropDown(_refEl: HTMLElement, _floatingEl: HTMLElement) {
		computePosition(_refEl, _floatingEl, {
			placement: "bottom-start",
			middleware: [
				size({
					apply({ availableHeight }) {
						_floatingEl.style.maxHeight = `${availableHeight}px`;
					},
					padding: 8,
				}),
			],
		});
	}

	function updateLabel(value: unknown) {
		for (const v of flatItems) {
			if (value !== v.value) continue;
			label = v.text;
			break;
		}
	}

	function processItems(_items: Items): Item[] {
		let res = [];
		if (Array.isArray(_items) && typeof _items[0] === "object") {
			for (const item of _items) {
				res.push(item);
			}
			return res;
		}

		if (Array.isArray(_items)) {
			for (const item of _items) {
				res.push({ text: item, value: item });
			}
			return res;
		}

		for (const [group, groupItems] of Object.entries(_items)) {
			res.push({ groupHeader: group });
			if (typeof groupItems[0] === "object")
				groupItems.forEach((it) => res.push({ ...it, group }));
			else groupItems.forEach((it) => res.push({ text: it, value: it, group }));
		}
		return res;
	}

	function handleSelect(e?: Event) {
		let pos = +(e?.target as HTMLElement).dataset?.pos;
		Number.isNaN(pos) && (pos = selectedId);
		let _value = availableItems[pos]?.value;
		if (!_value) return;

		isSelected = true;
		open = false;
		value = _value;
		dispatch("change", {
			id,
			value: _value,
		});
	}

	function clickOutside(node: HTMLElement, cb: () => void) {
		const handleClick = (e: MouseEvent) => {
			if (!node) return;
			if (!e.target) return;

			const path = e.composedPath();
			!path.includes(node) && cb();
		};

		window.addEventListener("click", handleClick, true);
		return {
			destroy() {
				window.removeEventListener("click", handleClick, true);
			},
		};
	}

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;

		if (isSelected) {
			target.value = (e as InputEvent).data;
			isSelected = false;
		}

		if (target.value.length === 0) {
			searchItems = undefined;
			return;
		}

		let search = fuse.search(target.value).map((it) => it.item);
		searchItems = search?.[0]?.group
			? processItems(groupBy(search, "group"))
			: search;
	}

	function handleKeyDown(e: KeyboardEvent) {
		switch (e.code) {
			case "Escape":
				e.preventDefault();
				return (open = false), (inputRef.value = label);
			case "Enter":
				return handleSelect();
			default:
				break;
		}
		if (e.code !== "ArrowDown" && e.code !== "ArrowUp") return;
		e.preventDefault();

		let max = availableItems.length;
		let dir = e.code === "ArrowDown" ? 1 : -1;
		let i = selectedId;

		i = i + dir < 0 ? max : i + dir;
		if (availableItems[i % max]?.groupHeader)
			i = i + dir < 0 ? max - 1 : i + dir;
		selectedId = i % max;
	}

	function handleMouseOver(e: MouseEvent) {
		const pos = (e.target as HTMLElement).dataset?.pos ?? false;
		if (!pos) return;

		selectedId = +pos;
	}
</script>

<div
	use:clickOutside={() => (open = false)}
	class="surface-2 card divide-y outline-none ring-2 ring-transparent transition-shadow {$$props.class} relative"
	class:rounded-b-none={open}
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		bind:this={refEl}
		on:click={() => (open = true)}
		class="inline-flex items-center pr-2"
	>
		<input
			bind:this={inputRef}
			on:keydown={handleKeyDown}
			on:input={handleSearch}
			class="w-full bg-transparent px-2 py-1.5 outline-none"
			type="text"
			value={label}
		/>
		<Icon><ChevronIcon dir="down" /></Icon>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<div
		bind:this={floatingEl}
		class="select surface-2 scrollbar absolute left-1/2 z-10 grid max-h-80 w-full -translate-x-1/2 gap-1 overflow-auto rounded-b-md p-2 py-2 shadow-md"
		class:hidden={!open}
		on:click={handleSelect}
		on:mouseover={handleMouseOver}
	>
		{#each availableItems as item, i}
			{#if item.groupHeader}
				<div class="font-bold">{item.groupHeader}</div>
			{:else}
				<div
					data-pos={i}
					class:bg-surface-400={i === selectedId}
					class:bg-opacity-20={i === selectedId}
					class:selected={item.value === value}
					class="cursor-default overflow-hidden text-ellipsis whitespace-nowrap rounded px-2 py-0.5 text-left"
					title={item.text}
				>
					{item.text}
				</div>
			{/if}
		{/each}
	</div>
</div>

<style lang="postcss">
	.selected {
		@apply bg-brand-500 text-white hover:bg-brand-400;
	}
</style>
