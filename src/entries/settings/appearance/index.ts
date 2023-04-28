import initTheme from "./theme";
import initColors from "./colors";
import initFonts from "./fonts";

export const initAppearance = () => (initTheme(), initColors(), initFonts());
export { default as Appearance } from "./Appearance.svelte";
