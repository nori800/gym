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
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-back": {
          from: { transform: "translateX(-30%)", opacity: "0.5" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "toast-in": {
          from: { transform: "translateY(-100%) scale(0.95)", opacity: "0" },
          to: { transform: "translateY(0) scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-in": "slide-in 250ms ease-out",
        "slide-back": "slide-back 200ms ease-out",
        "sheet-up": "sheet-up 300ms cubic-bezier(0.32,0.72,0,1)",
        "toast-in": "toast-in 300ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
