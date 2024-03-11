import { store } from "~/store.svelte";
import type {
	ServiceColor,
	Settings,
	ServiceCmp,
	ServiceConfig,
} from "./types";
import { colord } from "colord";
import colors from "tailwindcss/colors";
import type { DefaultColors } from "tailwindcss/types/generated/colors";

export const serversCfgs: any[] = [];

export function createServiceStore<T extends Settings>(
	name: string,
	initialValue: T,
) {
	const storedService = store.services.val[name];
	if (!storedService) {
		store.services.val[name] = initialValue;
	}

	return {
		get val() {
			return store.services.val[name] as T;
		},
		set val(value: T) {
			store.services.val[name] = value;
		},
	};
}

export function prepareService<T extends ServiceCmp>(service: T) {
	const config = serversCfgs.shift();

	return {
		name: config!.name,
		component: service,
		store: config!.store,
	};
}

export function initService<T extends ServiceConfig>(config: T) {
	const store = createServiceStore(config.name, {
		enabled: true,
		color: parseColor(config?.color),
		...(config.store as T["store"]),
		settings: config.settings as T["settings"],
	});
	config.store = store;
	serversCfgs.push(config);
	return {
		name: config.name,
		store: config.store as typeof store,
	};
}

function parseColor(color: string | null | undefined) {
	if (color?.[0] !== "#") {
		color = colors[color as keyof DefaultColors]["400"];
	}
	color ??= colord(
		`hsl(${Math.trunc(Math.random() * 360)}, 100%, 50%)`,
	).toHex();

	return color as ServiceColor;
}
