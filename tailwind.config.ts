import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-martian-mono)', 'Martian Mono', 'ui-monospace', 'monospace'],
        sans: ['var(--font-martian-mono)', 'Martian Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'zen-dark': '#191314',
        'zen-lime': '#ecf95a',
        'zen-gray': '#f4f4f4',
        'zen-white': '#ffffff',
        brand: {
          dark: '#191314',
          lime: '#ecf95a',
          gray: '#f4f4f4',
          white: '#ffffff',
          50: '#fefce8',
          100: '#fef9c3',
          500: '#ecf95a',
          600: '#dbe937',
          900: '#191314',
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-out forwards",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        'spin-slow': "spinSlow 16s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
