<script lang="ts">
	import {
		computePosition,
		flip,
		offset as offsetM,
		type Placement,
		shift,
		arrow,
	} from "@floating-ui/dom";
	import type { Snippet } from "svelte";

	interface Props {
		trigger?: "click" | "hover";
		position?: "top" | "bottom" | "left" | "right";
		placement?: "center" | "start" | "end";
		offset?: number;
		zIndex?: number;
		transition?: any[];
		withArrow?: boolean;
		arrowSize?: number;
		open?: boolean;
		class?: string;
		ref: Snippet;
		children: Snippet;
	}

	let {
		trigger = "click",
		position = "top",
		placement = "center",
		offset = 10,
		zIndex = 10,
		transition = [],
		withArrow = true,
		arrowSize = 8,
		open = false,
		class: className = "",
		ref,
		children,
	} = $props<Props>();

	let refEl: HTMLElement | undefined = $state();
	let triggerEl: HTMLElement | undefined = $state();
	let arrowEl: HTMLElement | undefined = $state();

	let isClickable = $derived(trigger === "click");

	$effect(() => {
		if (triggerEl && refEl && open) updatePopper();
	});

	$effect(() => {
		if (!triggerEl) return;
		if (triggerEl.tabIndex < 0) triggerEl.tabIndex = 0;

		const events = [
			["click", showHandler, isClickable],
			["mouseenter", showHandler, !isClickable],
			["mouseleave", hideHandler, !isClickable],
		].filter((e) => e[2]) as [string, any, boolean][];

		events.forEach(([event, handler]) =>
			triggerEl!.addEventListener(event, handler),
		);
		return () => {
			events.forEach(([event, handler]) =>
				triggerEl!.removeEventListener(event, handler),
			);
		};
	});

	$effect(() => {
		window.addEventListener("click", handleClickOutside);
		return () => window.removeEventListener("click", handleClickOutside);
	});

	function showHandler(e: Event) {
		e.type === "click" && e.stopPropagation();
		open = isClickable && e.type === "click" ? !open : true;
	}

	function hideHandler() {
		setTimeout(() => {
			if (triggerEl?.matches(":hover") || refEl?.matches(":hover")) return;
			open = false;
		}, 100);
	}

	function getTriggerEl(node: HTMLElement) {
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
		if (!triggerEl && !refEl) return;

		const _placement =
			placement !== "center" ? `${position}-${placement}` : position;

		computePosition(triggerEl!, refEl!, {
			placement: _placement as Placement,
			middleware: [
				offsetM(offset),
				flip(),
				shift({ padding: offset }),
				withArrow && arrow({ element: arrowEl! }),
			],
		}).then(({ x, y, placement, middlewareData }) => {
			if (!refEl) return;
			Object.assign(refEl.style, { left: `${x}px`, top: `${y}px` });

			if (!withArrow) return;
			const arrowX = middlewareData.arrow!.x;
			const arrowY = middlewareData.arrow!.y;

			const staticSide = {
				top: "bottom",
				right: "left",
				bottom: "top",
				left: "right",
			}[placement.split("-")[0]];

			const styleBorder = (plcmt: string) => {
				let x = "left";
				let y = "top";
				if (plcmt === "top" || plcmt === "bottom")
					(y = plcmt), (x = plcmt === "top" ? "left" : "right");
				if (plcmt === "left" || plcmt === "right")
					(x = plcmt), (y = plcmt === "left" ? "bottom" : "top");
				return { [`border-${x}`]: 0, [`border-${y}`]: 0 };
			};

			Object.assign(arrowEl!.style, {
				left: arrowX != null ? `${arrowX}px` : "",
				top: arrowY != null ? `${arrowY}px` : "",
				right: "",
				bottom: "",
				[staticSide!]: `${arrowSize / -2}px`,
				...styleBorder(placement.split("-")[0]),
			});
		});
	}

	function handleClickOutside(e: MouseEvent) {
		if (trigger !== "click") return;
		if (!open) return;

		const path = e.composedPath();
		if (path.filter((el) => el === refEl || el === triggerEl).length) return;
		open = false;
	}
</script>

{@render ref()}

{#if !triggerEl}
	<span use:getTriggerEl>contentRef</span>
{/if}

{#if open}
	<span
		bind:this={refEl}
		role="tooltip"
		class="surface-2 card absolute border border-surface-200 shadow-lg dark:border-surface-600 {className}"
		style="z-index: {zIndex}"
		in:trans={"in"}
		out:trans={"out"}
		onmouseenter={!isClickable ? showHandler : null}
		onmouseleave={!isClickable ? hideHandler : null}
	>
		{#if withArrow}
			<span
				bind:this={arrowEl}
				class="absolute rotate-45 bg-inherit"
				style="z-index: {zIndex}; width: {arrowSize}px; height: {arrowSize}px; border: inherit;"
			/>
		{/if}
		{@render children()}
	</span>
{/if}
