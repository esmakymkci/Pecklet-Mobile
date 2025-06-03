/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
    "./types/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#D54C27",
        secondary: "#F89D21",
        dark: "#303539",
        light: "#FBF9ED",
        white: "#FFFFFF",
        lightGray: "#E5E5E5",
        mediumGray: "#9E9E9E",
        darkGray: "#616161",
        success: "#4CAF50",
        error: "#F44336",
        info: "#2196F3",
        warning: "#FF9800",
        transparent: "transparent",
        overlay: "rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
