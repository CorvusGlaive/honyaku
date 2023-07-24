import type { ComponentType, SvelteComponent } from "svelte";
import type { Writable } from "svelte/store";

export type Service = {
	name: string;
	component: ServiceCmp;
	store: ServiceStore;
};

export type ServiceStore<T = unknown> = Writable<Settings<T>>;

export type ServiceCmp = ComponentType<
	SvelteComponent<
		{
			query: string;
			showResult?: (res: any) => void;
			translate?: (query: string) => void;
		},
		{ clear: CustomEvent }
	>
>;

export type ServiceConfig = {
	name: string;
	color?: ServiceColor;
	store?: Record<string, unknown>;
	settings?: Record<string, unknown>;
};

export type ServiceColor =
	| "red"
	| "orange"
	| "amber"
	| "yellow"
	| "lime"
	| "green"
	| "emerald"
	| "teal"
	| "cyan"
	| "sky"
	| "blue"
	| "indigo"
	| "violet"
	| "purple"
	| "fuchsia"
	| "pink"
	| "rose"
	| `#${string}`;

export type Settings<T = unknown> = {
	enabled: boolean;
	color: ServiceColor;
	settings?: T;
};
