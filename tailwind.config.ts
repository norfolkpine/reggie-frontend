import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stores/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/cunningham/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.css",
    "./components.json",
  ],
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
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["Ancizar Serif", "serif"],
        display: [
          "Funnel Display",
          "var(--font-red-hat-display)",
          "Red Hat Display",
          "system-ui",
          "sans-serif",
        ],
        heading: ["var(--font-raleway)", "Raleway", "system-ui", "sans-serif"],
        comfortaa: ["Comfortaa", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        raleway: ["var(--font-raleway)", "Raleway", "system-ui", "sans-serif"],
        "red-hat": [
          "var(--font-red-hat-display)",
          "Red Hat Display",
          "system-ui",
          "sans-serif",
        ],
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
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Opie brand colors
        opie: {
          purple: "#4f2c8f",
          teal: "#20B2AA",
          "purple-light": "#4f2c8f15",
          "purple-medium": "#4f2c8f20",
          "purple-dark": "#4f2c8f60",
          "purple-text": "#4f2c8f80",
          "teal-light": "#20B2AA05",
          "teal-medium": "#20B2AA08",
          "teal-dark": "#20B2AA15",
        },
        chart: {
          "1": "221, 83%, 53%",
          "2": "142, 71%, 45%",
          "3": "31, 90%, 56%",
        },
        shiki: {
          light: "var(--shiki-light)",
          "light-bg": "var(--shiki-light-bg)",
          dark: "var(--shiki-dark)",
          "dark-bg": "var(--shiki-dark-bg)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "typing-bounce": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-5px)",
          },
        },
        "typing-dot-bounce": {
          "0%,40%": {
            transform: "translateY(0)",
          },
          "20%": {
            transform: "translateY(-0.25rem)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "typing-dot-1": "typing-bounce 1.4s infinite 0.2s",
        "typing-dot-2": "typing-bounce 1.4s infinite 0.4s",
        "typing-dot-3": "typing-bounce 1.4s infinite 0.6s",
        "typing-dot-bounce": "typing-dot-bounce 1.25s ease-out infinite",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            code: {
              backgroundColor: "hsl(var(--muted))",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontWeight: "400",
            },
            "code::before": {
              content: '"',
            },
            "code::after": {
              content: '"',
            },
            pre: {
              backgroundColor: "hsl(var(--muted))",
              padding: "1em",
              borderRadius: "0.5rem",
              overflow: "auto",
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
            },
          },
        },
      },
    },
  },
  safelist: [
    "w-[256px]",
    "w-[320px]",
  ],
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;

export default config;

