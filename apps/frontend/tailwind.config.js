/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        svc: {
          green: "#006837",
          brightGreen: "#2ecc71",
          red: "#be1e2d",
          bg: "#121212",
          card: "#1e1e1e",
          input: "#2a2a2a",
          border: "#333333",
          text: "#ffffff",
          muted: "#888888"
        }
      }
    },
  },
  plugins: [],
}
