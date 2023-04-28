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
  import { tick } from "svelte";

  import type { TransitionConfig } from "svelte/transition";

  export let target: HTMLElement | string = portalRoot;
  export let zIndex = 10;
  export let transition = [];

  function init(node: HTMLElement, _target?: HTMLElement | string) {
    console.log("Portal:init", target);
    const root = getRootElement();
    let targetNode: HTMLElement;

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
  class={$$props.class}
  style="z-index: {zIndex}"
>
  <slot />
</div>
