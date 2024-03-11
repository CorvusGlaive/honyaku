<script lang="ts">
	import { Icon, Radio, RadioGroup } from "~/lib/components";
	import { store, type StoreType } from "~/store.svelte";

	const { theme } = store;
	const icons = [
		{
			value: "auto",
			label: "System theme",
		},
		{
			value: "light",
			label: "Light theme",
		},
		{
			value: "dark",
			label: "Dark theme",
		},
	];

	const getIconColor = (icon: string, _theme: StoreType<"theme">): string => {
		if (_theme === icon) return "currentColor";
		if (icon === "dark") return "royalblue";
		if (icon === "light") return "orange";
		return "currentColor";
	};
</script>

<RadioGroup value={theme.val} items={icons} onchange={(e) => (theme.val = e)}>
	{#snippet custom(icon)}
		<Radio value={icon.value}>
			<Icon title={icon.label} color={getIconColor(icon.value, theme.val)}>
				{#if icon.value === "auto"}
					<path
						d="M26,24H6a2.0023,2.0023,0,0,1-2-2V8A2.002,2.002,0,0,1,6,6H26a2.0023,2.0023,0,0,1,2,2V22A2.0027,2.0027,0,0,1,26,24ZM6,8V22H26V8Z"
						transform="translate(0 .005)"
					/><path d="M2 26.005H30V28.005H2z" />
				{:else if icon.value === "light"}
					<path d="M15 2H17V6.96H15z" /><path
						d="M21.67 6.85H26.630000000000003V8.85H21.67z"
						transform="rotate(-45 24.142 7.85)"
					/><path d="M25.04 15H30V17H25.04z" /><path
						d="M23.15 21.67H25.15V26.630000000000003H23.15z"
						transform="rotate(-45 24.152 24.146)"
					/><path d="M15 25.04H17V30H15z" /><path
						d="M5.37 23.15H10.33V25.15H5.37z"
						transform="rotate(-45 7.86 24.144)"
					/><path d="M2 15H6.96V17H2z" /><path
						d="M6.85 5.37H8.85V10.33H6.85z"
						transform="rotate(-45 7.85 7.848)"
					/><path d="M16,10a6,6,0,1,0,6,6,6,6,0,0,0-6-6Z" />
				{:else}
					<path
						d="M14.98,3a1.0024,1.0024,0,0,0-.1746.0156A13.0959,13.0959,0,0,0,16.63,28.9973c.1641.006.3282,0,.4909,0a13.0724,13.0724,0,0,0,10.702-5.5556,1.0094,1.0094,0,0,0-.7833-1.5644A13.08,13.08,0,0,1,15.8892,4.38,1.0149,1.0149,0,0,0,14.98,3Z"
					/>
				{/if}
			</Icon>
			<span class="capitalize">{icon.value}</span>
		</Radio>
	{/snippet}
</RadioGroup>
