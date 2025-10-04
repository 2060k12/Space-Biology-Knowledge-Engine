/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        naya: {
          50: "#FAFBFC",
          100: "#F3F6F9",
          300: "#C7CED6",
          400: "#A8B0B8",
          700: "#0F1724",
          primary: "#3366FF",
          "primary-600": "#254ED6",
          accent: "#FF7A59",
          success: "#22C55E",
          info: "#06B6D4",
          danger: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};
