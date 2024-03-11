import initTheme from "./theme.svelte";
import initColors from "./color.svelte";
import initFonts from "./fonts.svelte";

export const initAppearance = () => {
	initTheme();
	initColors();
	initFonts();
};
export { default as Appearance } from "./Appearance.svelte";
