import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic status colours — red = over budget / exception,
        // amber = approaching / pending, green = healthy / approved.
        over: {
          DEFAULT: "hsl(var(--over))",
          foreground: "hsl(var(--over-foreground))",
          soft: "hsl(var(--over-soft))",
          border: "hsl(var(--over-border))",
        },
        warn: {
          DEFAULT: "hsl(var(--warn))",
          foreground: "hsl(var(--warn-foreground))",
          soft: "hsl(var(--warn-soft))",
          border: "hsl(var(--warn-border))",
        },
        ok: {
          DEFAULT: "hsl(var(--ok))",
          foreground: "hsl(var(--ok-foreground))",
          soft: "hsl(var(--ok-soft))",
          border: "hsl(var(--ok-border))",
        },
        // Upstream systems, one colour each.
        src: {
          costx: "hsl(var(--src-costx))",
          "costx-soft": "hsl(var(--src-costx-soft))",
          xero: "hsl(var(--src-xero))",
          "xero-soft": "hsl(var(--src-xero-soft))",
          ezzybills: "hsl(var(--src-ezzybills))",
          "ezzybills-soft": "hsl(var(--src-ezzybills-soft))",
          approvalmax: "hsl(var(--src-approvalmax))",
          "approvalmax-soft": "hsl(var(--src-approvalmax-soft))",
          m365: "hsl(var(--src-m365))",
          "m365-soft": "hsl(var(--src-m365-soft))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        "card-hover": "0 2px 4px -1px rgb(15 23 42 / 0.06), 0 8px 16px -4px rgb(15 23 42 / 0.10)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
