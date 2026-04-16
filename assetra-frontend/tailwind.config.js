/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // 'class' strategy: dark mode is toggled by adding/removing 'dark' class on <html>
  // This is what ThemeContext.jsx controls — all members just use 'dark:' variants
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand orange palette — use these throughout the app
        orange: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",  // ← primary brand color
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // Semantic surface tokens — use these instead of raw gray
        // Light mode surfaces
        surface: {
          DEFAULT: "#ffffff",
          subtle:  "#f9fafb",
          muted:   "#f3f4f6",
          border:  "#e5e7eb",
        },
      },
      fontFamily: {
        sans:    ["'Sora'", "sans-serif"],
        display: ["'Cabinet Grotesk'", "'Sora'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(249,115,22,0)" },
          "50%":       { boxShadow: "0 0 24px 6px rgba(249,115,22,0.35)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up":         "fade-up 0.6s ease both",
        "fade-up-delay-1": "fade-up 0.6s ease 0.15s both",
        "fade-up-delay-2": "fade-up 0.6s ease 0.30s both",
        "fade-up-delay-3": "fade-up 0.6s ease 0.45s both",
        "fade-up-delay-4": "fade-up 0.6s ease 0.60s both",
        "fade-in":         "fade-in 0.8s ease both",
        "slide-in-right":  "slide-in-right 0.6s ease both",
        "scale-in":        "scale-in 0.5s ease both",
        "pulse-glow":      "pulse-glow 2.5s ease-in-out infinite",
        float:             "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};