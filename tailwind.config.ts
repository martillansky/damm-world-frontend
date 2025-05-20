import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          light: "#FFFFFF",
          DEFAULT: "#1A1625",
        },
        surface: {
          light: "#F8FAFC",
          DEFAULT: "#232034",
        },
        "surface-hover": {
          light: "#F1F5F9",
          DEFAULT: "#2C2B3A",
        },
        primary: {
          DEFAULT: "#EA580C",
          hover: "#C2410C",
          light: "#FB923C",
          dark: "#9A3412",
        },
        secondary: {
          DEFAULT: "#2CB67D",
          hover: "#25A06D",
          light: "#3EDB9B",
        },
        muted: {
          light: "#64748B",
          DEFAULT: "#94A3B8",
          dark: "#64748B",
        },
        highlight: {
          DEFAULT: "#EA580C",
          hover: "#C2410C",
          light: "#FB923C",
        },
        border: {
          light: "#E2E8F0",
          DEFAULT: "#2C2B3A",
        },
        foreground: {
          light: "#0F172A",
          DEFAULT: "#FFFFFF",
        },
        "gradient-start": "#EA580C",
        "gradient-end": "#FB923C",
        "gradient-violet": "#7F5AF0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        glow: "0 0 15px rgba(234, 88, 12, 0.3)",
        glowViolet: "0 0 15px rgba(127, 90, 240, 0.3)",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, var(--tw-gradient-start) 0%, var(--tw-gradient-end) 100%)",
        "gradient-surface":
          "linear-gradient(180deg, var(--tw-gradient-violet) 0%, var(--tw-gradient-start) 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(127, 90, 240, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%)",
        "gradient-card-light":
          "linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
