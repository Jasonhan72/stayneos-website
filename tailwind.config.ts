import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf8f6",
          100: "#f9ebe4",
          200: "#f3d5c9",
          300: "#eab5a3",
          400: "#df8d75",
          500: "#d4684d",
          600: "#c4523b",
          700: "#a34032",
          800: "#87362d",
          900: "#70302a",
          950: "#3d1512",
        },
        secondary: {
          50: "#f6f7f9",
          100: "#edeef1",
          200: "#d6d9e0",
          300: "#b3bac5",
          400: "#8a94a5",
          500: "#6b768a",
          600: "#566072",
          700: "#474e5d",
          800: "#3d434f",
          900: "#353a44",
          950: "#23262d",
        },
        accent: {
          gold: "#c9a962",
          cream: "#faf8f5",
          dark: "#1a1a1a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
