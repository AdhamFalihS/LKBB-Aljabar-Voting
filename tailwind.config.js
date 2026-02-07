/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { backgroundPositionX: "0%" },
          "100%": { backgroundPositionX: "-100%" },
        },
      },
    },
  },
  plugins: [],
};
