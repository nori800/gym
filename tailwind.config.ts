import type { Config } from "tailwindcss";

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
        surface: "#f3f3f3",
        accent: "#3eed8d",
        inverse: "#000000",
        "on-inverse": "#FFFFFF",
        "ios-toggle": "#34C759",
        danger: "#EF4444",
        border: "#ededed",
        primary: "#101010",
        secondary: "#7a7a7a",
        muted: "#9a9a9a",
        chip: "#ececec",
        chart: {
          line: "#1A1A1A",
          fill: "rgba(0, 0, 0, 0.06)",
          neutral: "#D4D4D4",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "var(--font-noto)",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
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
