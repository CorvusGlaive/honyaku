import { store } from "~/store.svelte";
import services from "./services";

export type { Service, Settings } from "./types";

class Translation {
	#services = services;

	get services() {
		const services = store.services.val;
		return this.#services.filter((s) => services[s.name]?.enabled ?? s);
	}

	getAllServices() {
		return this.#services;
	}

	getServiceByName(name: string) {
		return this.#services.find((s) => s.name === name);
	}

	getCurrentService() {
		const currentService = store.translationApi.val;
		return this.getServiceByName(currentService);
	}
}

export default new Translation();
