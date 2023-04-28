import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import mixPlugin from "colord/plugins/mix";
import { onMount } from "svelte";
import twColors from "tailwindcss/colors";
import { getRootElement } from "~/lib/utils";
import { store } from "~/store";

extend([mixPlugin, a11yPlugin]);

type Palette = {
	[K in keyof (typeof twColors)["blue"]]: string;
};

export default () =>
	onMount(() => {
		const unsub = store.accentColor.subscribe((color) => {
			let colors = twColors[color];
			if (!colors && colord(color).isValid()) {
				colors = generatePalette(color);
			}
			applyColorPalette(colors);
		});

		return unsub;
	});

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
		const index = i === 0 ? 50 : i * 100;
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
