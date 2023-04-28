import { store } from "~/store";
import { getRootElement } from "~/lib/utils";
import { onMount } from "svelte";

const { theme } = store;
const darkThemeMQ = window.matchMedia("(prefers-color-scheme: dark)");

export default () =>
	onMount(() => {
		const unsub = theme.subscribe(handleChangePreferedScheme);
		darkThemeMQ.addEventListener("change", handleChangePreferedScheme);
		return () => {
			unsub();
			darkThemeMQ.removeEventListener("change", handleChangePreferedScheme);
		};
	});

function handleChangePreferedScheme(
	e: MediaQueryListEvent | "auto" | "dark" | "light"
) {
	if (typeof e !== "string") {
		theme.get() === "auto" && toggleTheme(e.matches);
		return;
	}
	if (e === "auto") return toggleTheme(darkThemeMQ.matches);
	toggleTheme(e === "dark");
}

function toggleTheme(condition: boolean) {
	getRootElement().classList.toggle("dark", condition);
}
