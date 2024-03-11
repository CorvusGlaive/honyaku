import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import mixPlugin from "colord/plugins/mix";
import twColors from "tailwindcss/colors";
import type { DefaultColors } from "tailwindcss/types/generated/colors";
import { getRootElement } from "~/lib/utils";
import { store } from "~/store.svelte";

extend([mixPlugin, a11yPlugin]);

type Palette = {
	[K in keyof (typeof twColors)["blue"]]: string;
};

export default () => {
	$effect(() => {
		let colors = twColors[
			store.accentColor.val as keyof DefaultColors
		] as Palette;
		if (!colors && colord(store.accentColor.val).isValid()) {
			colors = generatePalette(store.accentColor.val);
		}
		applyColorPalette(colors);
	});
};

export function generatePalette(color: string): Palette {
	const _color = colord(color);

	const colors = [
		..._color
			.tints(7)
			.map((c) => c.toHex())
			.reverse()
			.slice(1, -1),
		..._color
			.shades(7)
			.map((c, i) => (i > 0 ? c.saturate(0.25).toHex() : c.toHex()))
			.slice(0, -2),
	];

	return colors.reduce((acc, cur, i) => {
		const index = (i === 0 ? 50 : i * 100) as any as keyof Palette;
		acc[index] = cur;
		return acc;
	}, {} as Palette);
}

export function applyColorPalette(colors: Palette) {
	const root = getRootElement();

	for (const [k, v] of Object.entries(colors)) {
		const color = v.substring(1);
		const r = +("0x" + color.slice(0, 2));
		const g = +("0x" + color.slice(2, 4));
		const b = +("0x" + color.slice(4));
		root.style.setProperty(`--brand-${k}`, `${r} ${g} ${b}`);
	}
}
