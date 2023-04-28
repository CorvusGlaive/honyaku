<script lang="ts">
	export let dir: "up" | "down" = "up";
</script>

<!-- {#if dir === "up"} -->
<!--   <path d="M16 10L26 20 24.6 21.4 16 12.8 7.4 21.4 6 20z" /> -->
<!-- {:else} -->
<!--   <path d="M16 22L6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z" /> -->
<!-- {/if} -->
<path
	class="origin-center {$$props.class}"
	class:rotate-180={dir === "down"}
	d="M16 10L26 20 24.6 21.4 16 12.8 7.4 21.4 6 20z"
/>
