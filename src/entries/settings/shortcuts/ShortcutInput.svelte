<script lang="ts">
	import clsx from "clsx";
	import { createEventDispatcher } from "svelte";
	import Button from "~/lib/components/Button.svelte";
	import Icon from "~/lib/components/Icon.svelte";
	import type { KeymapStore } from "~/lib/keymapps";

	const dispatch = createEventDispatcher();
	const modsMap = {
		s: "Shift",
		c: "Ctrl",
		a: "Alt",
		Shift: "s",
		Ctrl: "c",
		Alt: "a",
	};

	export let keys: KeymapStore;
	$: key = keys?.[1] || keys[0];
	$: value = formatKeys(key);

	let isInsert = false;
	let error = "";

	function formatKeys(key: string) {
		const _keys = key.split("-");

		let letter = _keys.pop();
		if (letter.length === 1 && letter >= "A" && letter <= "z") {
			letter = letter.toUpperCase();
		}
		isInsert = _keys.includes("i");
		let mods = _keys.filter((it) => it !== "i").map((it) => modsMap[it]);

		mods.push(letter);
		return mods;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.repeat) return;
		e.preventDefault();

		let _value = [];
		let key = e.code;

		e.ctrlKey && _value.push("Ctrl");
		e.altKey && _value.push("Alt");
		e.shiftKey && _value.push("Shift");

		key = key.replace("Key", "");
		key = key.replace("Digit", "");
		["Control", "Shift", "Alt", "Meta"].includes(e.key) && (key = "");

		error = key ? "" : "Type a letter";
		key && _value.push(key);

		value = _value;
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (error) return (value = formatKeys(key));
		if (["Shift", "Control", "Alt"].includes(e.key)) return;

		let res = "";

		isInsert && value.unshift("i");
		res = value
			.map((it) => {
				if (modsMap[it]) return modsMap[it];
				return it.length === 1 ? it.toLowerCase() : it;
			})
			.join("-");
		console.log("handleKeyUp", value, res);
		dispatch("change", res);
	}

	const kbdClasses = (key: string) =>
		clsx(
			"card",
			"surface-2",
			"p-1",
			"leading-none",
			"cursor-default",
			"select-none",
			key.length === 1 && "flex aspect-square w-6 items-center justify-center"
		);
</script>

<div
	class="shadow-concave flex gap-2 rounded-md p-1 ring-2 ring-transparent focus-within:ring-brand-400 hover:bg-brand-500/10"
	class:!ring-rose-400={error}
>
	{#each value as key}
		<kbd class={kbdClasses(key)}>{key}</kbd>
	{/each}
	<input
		type="text"
		class="w-0 opacity-0"
		on:keyup={handleKeyUp}
		on:keydown={handleKeyDown}
		on:blur={() => (error = "")}
	/>
	{#if keys?.[1]}
		<Button
			icon
			className="ml-auto pr-2 z-[1]"
			on:click={() => dispatch("reset")}
		>
			<Icon title="restore default shortcuts">
				<path
					d="M18 28A12 12 0 1 0 6 16v6.2l-3.6-3.6L1 20l6 6l6-6l-1.4-1.4L8 22.2V16a10 10 0 1 1 10 10Z"
				/>
			</Icon>
		</Button>
	{/if}
</div>
{#if error}
	<span class="text-sm text-rose-400">{error}</span>
{/if}

<style global>
	.shadow-concave {
		box-shadow: var(--tw-ring-shadow), inset 1px 2px 2px -1px rgb(0 0 0 / 0.1),
			1px 2px 2px 0px rgb(255 255 255 / 1);
	}
	.dark .shadow-concave {
		box-shadow: var(--tw-ring-shadow), inset 1px 2px 2px -1px rgb(0 0 0 / 0.4),
			1px 2px 2px -2px rgb(255 255 255 / 0.1);
	}
</style>
