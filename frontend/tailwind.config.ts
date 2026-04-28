import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
        brand: ["Caveat", "cursive"],
      },
      colors: {
        brand: {
          DEFAULT: "#008236",
          dark: "#004d3a",
          deep: "#0b3d34",
          mint: "#eafaf3",
          cream: "#dff7ed",
          accent: "#00e0aa",
          line: "#cfe7dc",
          muted: "#6b817a",
          warn: "#f6a623",
          danger: "#e5484d",
          danger_bg: "#fdecec",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 61, 52, 0.04), 0 4px 12px rgba(11, 61, 52, 0.04)",
        soft: "0 8px 24px rgba(0, 130, 54, 0.10)",
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
} satisfies Config;
