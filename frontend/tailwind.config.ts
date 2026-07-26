import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        zoom: {
          blue: "#2D8CFF",
          "blue-dark": "#0B5CD7",
          "blue-light": "#EDF5FF",
          gray: {
            50: "#F7F8FA",
            100: "#F0F1F3",
            200: "#E5E7EB",
            300: "#D1D5DB",
            600: "#6B7280",
            700: "#4B5563",
            800: "#2E3238",
            900: "#1C1D21",
          },
          red: "#E02828",
          green: "#2CA65E",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
