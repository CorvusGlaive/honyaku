import { store } from "~/store";
import { derived, type Readable } from "svelte/store";
import type {
	ServiceColor,
	Settings,
	ServiceStore,
	ServiceCmp,
	ServiceConfig,
} from "./types";
import { colord } from "colord";
import colors from "tailwindcss/colors";
import { defaultsDeep } from "lodash-es";

export const serversCfgs = [];

export function createServiceStore<T extends Settings>(
	name: string,
	initialValue: T
) {
	const storedService = store.services.get()[name];
	if (!storedService) {
		store.services.update((s) => {
			s[name] = initialValue;
			return s;
		});
	} else {
		initialValue = defaultsDeep(storedService, initialValue) as T;
	}

	const { subscribe } = derived(
		store.services,
		($services) =>
			(initialValue = defaultsDeep($services[name], initialValue) as T)
	) as Readable<T>;

	const get = () => initialValue;

	const set = (value: T) => {
		console.log(
			"%cSERVICE_SETTING:" + name + "::SET ->",
			"color: mediumspringgreen; font-size:14px;",
			value
		);
		initialValue = value = defaultsDeep(value, initialValue);
		store.services.update((s) => {
			s[name] = value;
			return s;
		});
	};

	const update = (fn: (store: T) => T) =>
		set(fn(store.services.get()[name] as T));

	return { get, set, update, subscribe };
}

export function prepareService<T extends ServiceCmp>(service: T) {
	const config = serversCfgs.shift();

	return {
		name: config.name as string,
		component: service,
		store: config.store as ServiceStore<any>,
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

function parseColor(color: string | null) {
	if (color?.[0] !== "#") {
		color = colors[color]["400"];
	}
	color ??= colord(
		`hsl(${Math.trunc(Math.random() * 360)}, 100%, 50%)`
	).toHex();

	return color as ServiceColor;
}
