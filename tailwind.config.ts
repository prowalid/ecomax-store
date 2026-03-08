import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],    // 11px
        xs: ["0.75rem", { lineHeight: "1rem" }],          // 12px
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],     // 13px
        base: ["0.875rem", { lineHeight: "1.375rem" }],   // 14px
        lg: ["1rem", { lineHeight: "1.5rem" }],            // 16px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],        // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],         // 24px
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          subtle: "hsl(var(--success-subtle-bg))",
          "subtle-text": "hsl(var(--success-subtle-text))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        attention: {
          DEFAULT: "hsl(var(--attention))",
          bg: "hsl(var(--attention-bg))",
          text: "hsl(var(--attention-text))",
        },
        critical: {
          DEFAULT: "hsl(var(--critical))",
          bg: "hsl(var(--critical-bg))",
          text: "hsl(var(--critical-text))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-bg))",
          foreground: "hsl(var(--sidebar-fg))",
          active: "hsl(var(--sidebar-active))",
          "active-foreground": "hsl(var(--sidebar-active-fg))",
          "active-bg": "hsl(var(--sidebar-active-bg))",
          hover: "hsl(var(--sidebar-hover))",
          border: "hsl(var(--sidebar-border))",
          heading: "hsl(var(--sidebar-heading))",
          icon: "hsl(var(--sidebar-icon))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "card": "0 1px 0 0 rgba(0,0,0,.05)",
        "card-hover": "0 0 0 1px rgba(63,63,68,.05), 0 1px 3px 0 rgba(63,63,68,.15)",
        "shopify": "0 0 5px rgba(23,24,24,.05), 0 1px 2px rgba(0,0,0,.07)",
        "shopify-lg": "0 0 0 1px rgba(6,44,82,.1), 0 2px 16px rgba(33,43,54,.08)",
        "button": "0 1px 0 rgba(0,0,0,.05)",
        "inset": "inset 0 1px 1px 0 rgba(0,0,0,.05), inset 0 0 0 1px rgba(0,0,0,.08)",
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
        "slide-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.15s ease-out",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
