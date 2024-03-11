import { store } from "~/store.svelte";
import { getRootElement } from "~/lib/utils";

const { theme } = store;
const darkThemeMQ = window.matchMedia("(prefers-color-scheme: dark)");
darkThemeMQ.onchange = handleChangePreferedScheme;

export default () => {
	$effect(() => {
		handleChangePreferedScheme(theme.val);
	});
};

function handleChangePreferedScheme(
	e: MediaQueryListEvent | "auto" | "dark" | "light",
) {
	if (typeof e !== "string") {
		theme.val === "auto" && toggleTheme(e.matches);
		return;
	}
	if (e === "auto") return toggleTheme(darkThemeMQ.matches);
	toggleTheme(e === "dark");
}

function toggleTheme(condition: boolean) {
	getRootElement().classList.toggle("dark", condition);
}
