/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        algo: {
          bg: "#080810",
          surface: "#0f0f1a",
          card: "#13131f",
          border: "#1e1e30",
          accent: "#6c63ff",
          "accent-2": "#ff6584",
          "accent-3": "#43e97b",
          muted: "#3a3a55",
          text: "#e8e8f0",
          "text-muted": "#7070a0",
        },
      },
    },
  },
  plugins: [],
};
