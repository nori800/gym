import type { Config } from "tailwindcss";

/**
 * Design tokens — docs/design/01-ui-design-guidelines.md と同期すること
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "#FFFFFF",
        surface: "#F5F5F7",
        accent: "#DCFC67",
        danger: "#EF4444",
        border: "#EBEBEB",
        primary: "#1A1A1A",
        secondary: "#6B6B6B",
        muted: "#B0B0B0",
        chart: {
          line: "#DCFC67",
          fill: "rgba(220, 252, 103, 0.12)",
          neutral: "#D4D4D4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Helvetica Neue", "Arial", "sans-serif"],
      },
      fontWeight: {
        caption: "300",
        label: "400",
        title: "600",
        metric: "500",
      },
    },
  },
  plugins: [],
};

export default config;
