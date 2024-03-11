<script context="module" lang="ts">
	let portalRoot: HTMLElement;

	function getRootElement() {
		return document.getElementById("honyaku")?.shadowRoot || document.body;
	}

	function addPortalMount() {
		const root = getRootElement();

		if (root.querySelector("portal")) return;

		portalRoot = document.createElement("portal");
		root.appendChild(portalRoot);
	}
	addPortalMount();
</script>

<script lang="ts">
	import { tick, type Snippet } from "svelte";

	import type { TransitionConfig } from "svelte/transition";

	interface Props {
		target?: HTMLElement | string;
		zIndex?: number;
		transition?: any[];
		class?: string;
		children: Snippet;
	}
	let {
		target = portalRoot,
		zIndex = 10,
		transition = [],
		class: className = "",
		children,
	} = $props<Props>();

	function init(node: HTMLElement, _target: HTMLElement | string) {
		const root = getRootElement();
		let targetNode: HTMLElement | null;

		async function update(newTarget: HTMLElement | string) {
			if (typeof newTarget === "string") {
				targetNode = root.querySelector(newTarget);
				if (!targetNode) {
					await tick();
					targetNode = root.querySelector(newTarget);
				}
				if (!targetNode)
					throw new Error(`Couldn't find an element with: ${newTarget}`);
			} else if (newTarget instanceof HTMLElement) {
				targetNode = newTarget;
			} else {
				throw new Error("Unknow target");
			}
			targetNode.appendChild(node);
		}

		function destroy() {
			node.remove();
		}

		update(_target);
		return {
			update,
			destroy,
		};
	}

	function trans(node: Node) {
		return transition[0]?.(node, transition?.[1]) as TransitionConfig;
	}
</script>

<div
	transition:trans
	use:init={target}
	class={className}
	style="z-index: {zIndex}"
>
	{@render children()}
</div>
