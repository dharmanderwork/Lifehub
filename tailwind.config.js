/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        surface: "var(--bg-surface)",
        card: "var(--bg-card)",
        border: "var(--border-color)",
        primary: { DEFAULT: "#6366f1", hover: "#4f46e5" }
      }
    },
  },
  plugins: [],
};
