/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#F5C518",
          yellow: "#E2B616",
          dark: "#0B0C10",
          surface: "#14171F",
          surface2: "#1E222D",
          border: "#2A303C",
          cyan: "#00E5FF",
          purple: "#A855F7",
          rose: "#F43F5E",
          emerald: "#10B981",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      }
    },
  },
  plugins: [],
}
