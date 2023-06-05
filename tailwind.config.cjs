const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const {
	default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

function useSpacing(value) {
	return `calc(${parseFloat(value)} * var(--font-size, 16px))`;
}

function remToPx(config) {
	for (const [key, value] of Object.entries(config)) {
		config[key] = value.includes("px") ? value : useSpacing(value);
	}
	return config;
}

let fontSize = defaultTheme.fontSize;
for (const [key, font] of Object.entries(fontSize)) {
	fontSize[key] = font.map((value) => {
		if (typeof value === "string") return useSpacing(value);
		const lh = value.lineHeight;
		value.lineHeight = lh.includes("rem") ? useSpacing(lh) : lh;
		return value;
	});
}

function mapBrandColor() {
	const blueColor = { ...colors.blue };

	for (const k in blueColor) {
		blueColor[k] = `rgb(var(--brand-${k}) / <alpha-value>)`;
	}

	return blueColor;
}

module.exports = {
	darkMode: "class",
	content: ["./src/**/*.{html,ts,svelte}"],
	theme: {
		spacing: remToPx(defaultTheme.spacing),
		borderRadius: remToPx(defaultTheme.borderRadius),
		fontSize,
		extend: {
			fontFamily: {
				sans: ["Roboto Flex Variable", ...defaultTheme.fontFamily.sans],
			},
			colors: {
				brand: mapBrandColor(),
				surface: colors.zinc,
			},
			rotate: {
				full: "360deg",
			},
		},
	},
	plugins: [
		function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					"bg-grid": (value) => ({
						backgroundSize: "6px 6px",
						backgroundImage: `linear-gradient(45deg, ${value} 1px, transparent 1px), linear-gradient(135deg, ${value} 1px, transparent 1px)`,
					}),
				},
				{ values: flattenColorPalette(theme("backgroundColor")), type: "color" }
			);
		},
	],
};
