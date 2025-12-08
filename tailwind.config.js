module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff7aac',
          dark: '#ff5f97',
        },
        // keep default black but provide an alias
        brandBlack: '#000000',
      },
    },
  },
  plugins: [],
};
