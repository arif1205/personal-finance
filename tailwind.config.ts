import type { Config } from "tailwindcss";

const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
	darkMode: ["class"],
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.ts"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", "system-ui", "sans-serif"],
			},
			colors: {
				background: token("background"),
				foreground: token("foreground"),
				card: token("card"),
				muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
				border: token("border"),
				input: token("input"),
				ring: token("ring"),
				primary: { DEFAULT: token("primary"), foreground: token("primary-foreground") },
				owed: token("owed"),
				owe: token("owe"),
				danger: token("danger"),
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 4px)",
				sm: "calc(var(--radius) - 6px)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
