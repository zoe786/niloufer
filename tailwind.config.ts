import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts}",
    "./types/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      // ── Cafe Niloufer brand palette ──────────────────────────────────────
      colors: {
        // Anchor: deep maroon / burgundy
        "niloufer-burgundy": "#7C1D33",
        "niloufer-maroon": "#6B1028",

        // Surfaces: cream / ivory
        "niloufer-cream": "#FDF6EC",
        "niloufer-ivory": "#F9EED8",

        // Neutrals: warm walnut / chai browns
        "niloufer-walnut": "#6B3A2A",
        "niloufer-chai": "#92400E",

        // Accents: antique gold / brass
        "niloufer-gold": "#B8860B",
        "niloufer-brass": "#C8973A",

        // Text: soft charcoal
        "niloufer-charcoal": "#2D2017",

        // Optional: muted blue lotus (use sparingly)
        "niloufer-lotus": "#4A6FA5",

        // Legacy CSS variable support
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", '"Times New Roman"', "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
