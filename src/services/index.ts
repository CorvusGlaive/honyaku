import { derived } from "svelte/store";
import { store } from "~/store";
import services from "./services";

export type { Service, Settings } from "./types";

class Translation {
	#services = services;

	get services() {
		const services = store.services.get();
		return this.#services.filter((s) => services[s.name]?.enabled ?? s);
	}

	getAllServices() {
		return this.#services;
	}

	getServiceByName(name: string) {
		return this.#services.find((s) => s.name === name);
	}

	getCurrentService() {
		const currentService = store.translationApi.get();
		return this.getServiceByName(currentService);
	}

	currentService() {
		return derived(store.translationApi, ($name: string) =>
			this.getServiceByName($name)
		);
	}
}

export default new Translation();
