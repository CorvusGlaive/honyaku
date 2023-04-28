<script lang="ts">
  export let json = {};
  export let contenteditable = false;
</script>

<pre
  {contenteditable}
  on:keydown
  class="m-auto w-max whitespace-pre-wrap rounded-xl bg-grey-800 p-3 text-left text-xs text-grey-50 outline-none ring-1 ring-inset ring-white/10 focus-visible:ring-2 focus-visible:ring-brand-500 dark:focus-visible:ring-brand-500/80">{JSON.stringify(
    json,
    null,
    2
  )}</pre>
