<script lang="ts">
  export let text = "";
  export let pos:
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "pronoun"
    | "other" = "other";

  let cssClass;
  $: switch (pos) {
    case "noun":
      cssClass = "bg-blue-400/20 border-blue-400";
      break;
    case "verb":
      cssClass = "bg-purple-400/20 border-purple-400";
      break;
    case "adjective":
      cssClass = "bg-orange-500/20 border-orange-500";
      break;
    case "adverb":
      cssClass = "bg-green-400/20 border-green-400";
      break;
    case "pronoun":
      cssClass = "bg-rose-400/20 border-rose-400";
      break;
    case "other":
    default:
      cssClass = "bg-gray-400/20 border-gray-400";
      break;
  }
</script>

<span title={pos} class="{cssClass} rounded-md  border px-1 py-0.5 text-sm">{text}</span>
