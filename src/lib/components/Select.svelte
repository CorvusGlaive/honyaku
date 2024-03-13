<script lang="ts">
	import Fuse from "fuse.js";
	import ChevronIcon from "../icons/ChevronIcon.svelte";
	import Icon from "./Icon.svelte";
	import Scrollbar, { isScrollThumbHold } from "./Scrollbar.svelte";
	import { computePosition, size } from "@floating-ui/dom";

	type Item = {
		groupHeader?: string;
		group?: string;
		text?: string;
		value?: unknown;
	};

	type Items =
		| Record<string, { text: string; value: unknown }[]>
		| Record<string, (string | number)[]>
		| (string | number)[]
		| { text: string; value: unknown }[];

	interface Props {
		id?: string;
		value: unknown;
		items: Items;
		class?: string;
		onchange?: (args: { id?: string; value: unknown }) => void;
	}
	let { id = "", value, items, class: className, onchange } = $props<Props>();

	let searchItems: Item[] = $state([]);
	let label = $state(typeof value === "string" ? value : "");
	let open = $state(false);
	let selectedId = $state(0);
	let isSelected = true;
	let floatingEl: HTMLElement;
	let refEl: HTMLElement;
	let inputRef: HTMLInputElement;
	let scrollTop = $state(-1);

	const fuse = new Fuse<Item>([], {
		keys: [
			{ name: "text", weight: 0.8 },
			{ name: "value", weight: 0.2 },
		],
	});

	let flatItems = $derived.by(() => {
		let fItems = processItems(items);
		fuse.setCollection(fItems);
		return fItems;
	});
	$effect(() => {
		value && updateLabel(value);
	});
	$effect(() => {
		if (open) {
			placeDropDown(refEl, floatingEl);
			initSelection();
			scrollTop = 0;
		} else {
			onClose();
			scrollTop = -1;
		}
	});
	$effect(() => {
		searchItems.length && initSelection();
	});
	let availableItems = $derived(searchItems.length ? searchItems : flatItems);

	function onClose() {
		selectedId = 0;
		isSelected = true;
		inputRef?.blur();
		inputRef && (inputRef.value = label);
		searchItems.length = 0;
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
						_floatingEl.style.height = `${availableHeight}px`;
					},
					padding: 8,
				}),
			],
		});
	}

	function updateLabel(value: unknown) {
		for (const v of flatItems) {
			if (value !== v.value) continue;
			label = v.text ?? "";
			break;
		}
	}

	function processItems(_items: Items): Item[] {
		let res: Item[] = [];
		if (Array.isArray(_items) && typeof _items[0] === "object") {
			for (const item of _items) {
				res.push(item as Item);
			}
			return res;
		}

		if (Array.isArray(_items)) {
			for (const item of _items) {
				res.push({ text: item as string, value: item });
			}
			return res;
		}

		for (const [group, groupItems] of Object.entries(_items)) {
			res.push({ groupHeader: group });
			if (typeof groupItems[0] === "object")
				(groupItems as Item[]).forEach((it) => res.push({ ...it, group }));
			else
				(groupItems as string[]).forEach((it) =>
					res.push({ text: it, value: it, group }),
				);
		}
		return res;
	}

	function handleSelect(e?: Event) {
		let pos = !e ? selectedId : Number((e.target as HTMLElement)?.dataset?.pos);
		if (Number.isNaN(pos)) return;
		let _value = availableItems[pos]?.value;
		if (!_value) return;

		isSelected = true;
		open = false;
		onchange?.({
			id,
			value: _value,
		});
	}

	function clickOutside(node: HTMLElement, cb: () => void) {
		const handleClick = (e: MouseEvent) => {
			if (!open) return;
			if (isScrollThumbHold()) return;
			if (!node) return;
			if (!e.target) return;

			const path = e.composedPath();
			!path.includes(node) && cb();
		};

		window.addEventListener("mouseup", handleClick, true);
		return {
			destroy() {
				window.removeEventListener("mouseup", handleClick, true);
			},
		};
	}

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;

		if (isSelected) {
			target.value = (e as InputEvent).data ?? "";
			isSelected = false;
		}

		if (target.value.length === 0) {
			searchItems.length = 0;
			return;
		}

		let search = fuse.search(target.value).map((it) => it.item);
		searchItems = search?.[0]?.group
			? processItems(Object.groupBy(search, ({ group }) => group) as Items)
			: search;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if ("__root" in e) return;
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
	class="surface-2 card divide-y outline-none ring-2 ring-transparent transition-shadow {className} relative"
	class:rounded-b-none={open}
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		bind:this={refEl}
		onclick={(e) => {
			e.target === inputRef ? (open = true) : (open = !open);
		}}
		class="inline-flex items-center pr-2"
	>
		<input
			bind:this={inputRef}
			onkeydown={handleKeyDown}
			oninput={handleSearch}
			class="w-full bg-transparent px-2 py-1.5 outline-none"
			type="text"
			value={label}
		/>
		<Icon><ChevronIcon dir="down" /></Icon>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		bind:this={floatingEl}
		class="select surface-2 absolute left-1/2 z-10 w-full -translate-x-1/2 rounded-b-md shadow-md"
		class:hidden={!open}
		onclick={handleSelect}
		onmouseover={handleMouseOver}
	>
		<Scrollbar {scrollTop} containerClasses="grid auto-rows-max gap-1 p-2 py-2">
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
		</Scrollbar>
	</div>
</div>

<style lang="postcss">
	.selected {
		@apply bg-brand-500 text-white hover:bg-brand-400;
	}
</style>
