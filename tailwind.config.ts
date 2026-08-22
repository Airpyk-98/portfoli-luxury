import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        glass: {
          dark: "rgba(10, 15, 12, 0.75)",
          "dark-subtle": "rgba(16, 24, 20, 0.45)",
          "dark-elevated": "rgba(22, 34, 28, 0.85)",
          light: "rgba(255, 255, 255, 0.8)",
          "light-subtle": "rgba(255, 255, 255, 0.5)",
          "light-elevated": "rgba(255, 255, 255, 0.95)",
        },
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          accent: "#00FF87",
          neon: "#00FF87",
          emerald: "#10B981",
          obsidian: "#070908",
          charcoal: "#0F1412",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-syne)", "var(--font-space-grotesk)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.2)",
        "glass-glow": "0 0 25px -5px rgba(0, 255, 135, 0.3)",
        "glass-glow-lg": "0 0 50px -10px rgba(0, 255, 135, 0.4)",
        "glass-light": "0 8px 30px rgba(0, 0, 0, 0.06)",
        "glass-light-glow": "0 0 25px -5px rgba(5, 150, 105, 0.25)",
      },
      transitionTimingFunction: {
        'cinematic-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'cinematic-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'cinematic-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'spring-gentle': 'cubic-bezier(0.34, 1.3, 0.64, 1)',
        'power4-out': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
        '1200': '1200ms',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s infinite linear",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
