/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f17",
        surface: "#141c2b",
        accent: "#3b82f6",
        purpleAccent: "#8b5cf6",
        cardBg: "#1a2436",
      },
    },
  },
  plugins: [],
}
