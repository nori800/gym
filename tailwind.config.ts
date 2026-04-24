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
        surface: "#F5F5F7",
        accent: "#3eed8d",
        inverse: "#000000",
        "on-inverse": "#FFFFFF",
        "ios-toggle": "#34C759",
        danger: "#EF4444",
        border: "#EBEBEB",
        primary: "#1A1A1A",
        secondary: "#6B6B6B",
        muted: "#999999",
        chip: "#ececec",
        chart: {
          line: "#3eed8d",
          fill: "rgba(62,237,141,0.12)",
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
      keyframes: {
        "toast-in": {
          from: { transform: "translateY(-100%) scale(0.95)", opacity: "0" },
          to: { transform: "translateY(0) scale(1)", opacity: "1" },
        },
      },
      animation: {
        "toast-in": "toast-in 300ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
