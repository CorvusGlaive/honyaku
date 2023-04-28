<script lang="ts">
	import {
		computePosition,
		flip,
		offset as offsetM,
		type Placement,
		shift,
		arrow,
	} from "@floating-ui/dom";

	import { onMount } from "svelte";

	export let trigger: "click" | "hover" = "click";
	export let position: "top" | "bottom" | "left" | "right" = "top";
	export let placement: "center" | "start" | "end" = "center";
	export let offset = 10;
	export let zIndex = 10;
	export let transition = [];
	export let withArrow = true;
	export let arrowSize = 8;
	export let open = false;

	let ref: HTMLElement;
	let triggerEl: HTMLElement;
	let arrowEl: HTMLElement;

	$: isClickable = trigger === "click";
	$: if (triggerEl && ref && open) updatePopper();

	onMount(() => {
		if (!triggerEl) throw new Error("No reference element was found");
		if (triggerEl.tabIndex < 0) triggerEl.tabIndex = 0;

		const events = [
			["click", showHandler, isClickable],
			["mouseenter", showHandler, !isClickable],
			["mouseleave", hideHandler, !isClickable],
		].filter((e) => e[2]) as [string, any, boolean][];

		events.forEach(([event, handler]) =>
			triggerEl.addEventListener(event, handler)
		);
		return () => {
			events.forEach(([event, handler]) =>
				triggerEl.removeEventListener(event, handler)
			);
		};
	});

	function showHandler(e: Event) {
		e.type === "click" && e.stopPropagation();
		open = isClickable && e.type === "click" ? !open : true;
	}

	function hideHandler() {
		setTimeout(() => {
			if (triggerEl?.matches(":hover") || ref?.matches(":hover")) return;
			open = false;
		}, 100);
		return undefined;
	}

	function getTriggerEl(node: HTMLElement) {
		if (!$$slots.ref) throw new Error("Specify trigger element in 'ref' slot");
		triggerEl = node.previousElementSibling as HTMLElement;
	}

	function trans(node: HTMLElement, dir: "in" | "out") {
		const [inFn, inArgs, outFn, outArgs] = transition;
		if (!inFn) return null;

		if (dir === "in") {
			return inFn(node, inArgs);
		}
		if (typeof outFn === "object") return inFn(node, { ...inArgs, ...outFn });
		if (typeof outFn === "function") return outFn(node, outArgs);
		return inFn(node, inArgs);
	}

	function updatePopper() {
		if (!triggerEl && !ref) return;

		const _placement =
			placement !== "center" ? `${position}-${placement}` : position;

		computePosition(triggerEl, ref, {
			placement: _placement as Placement,
			middleware: [
				offsetM(offset),
				flip(),
				shift({ padding: offset }),
				withArrow && arrow({ element: arrowEl }),
			],
		}).then(({ x, y, placement, middlewareData }) => {
			if (!ref) return;
			Object.assign(ref.style, { left: `${x}px`, top: `${y}px` });

			if (!withArrow) return;
			const { x: arrowX, y: arrowY } = middlewareData.arrow;

			const staticSide = {
				top: "bottom",
				right: "left",
				bottom: "top",
				left: "right",
			}[placement.split("-")[0]];

			const styleBorder = (plcmt: string) => {
				let x: string, y: string;
				if (plcmt === "top" || plcmt === "bottom")
					(y = plcmt), (x = plcmt === "top" ? "left" : "right");
				if (plcmt === "left" || plcmt === "right")
					(x = plcmt), (y = plcmt === "left" ? "bottom" : "top");
				return { [`border-${x}`]: 0, [`border-${y}`]: 0 };
			};

			Object.assign(arrowEl.style, {
				left: arrowX != null ? `${arrowX}px` : "",
				top: arrowY != null ? `${arrowY}px` : "",
				right: "",
				bottom: "",
				[staticSide]: `${arrowSize / -2}px`,
				...styleBorder(placement.split("-")[0]),
			});
		});
	}
	function handleClickOutside(e: MouseEvent) {
		if (!open) return;

		const path = e.composedPath();
		if (path.filter((el) => el === ref || el === triggerEl).length) return;
		open = false;
	}
</script>

<svelte:window on:click={trigger === "click" && handleClickOutside} />

<slot name="ref" />

{#if !triggerEl}
	<span use:getTriggerEl>contentRef</span>
{/if}

{#if open}
	<span
		bind:this={ref}
		class="surface-2 card absolute border border-surface-200 shadow-lg dark:border-surface-600 {$$props.class}"
		style="z-index: {zIndex}"
		in:trans={"in"}
		out:trans={"out"}
		on:mouseenter={!isClickable ? showHandler : null}
		on:mouseleave={!isClickable ? hideHandler : null}
	>
		{#if arrow}
			<span
				bind:this={arrowEl}
				class="absolute rotate-45 bg-inherit"
				style="z-index: {zIndex}; width: {arrowSize}px; height: {arrowSize}px; border: inherit;"
			/>
		{/if}
		<slot />
	</span>
{/if}
