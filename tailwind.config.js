/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#2a2a2a',
          light: '#ffffff',
        },
        app: {
          red: '#e73828',
          black: '#070707',
          white: '#FFFFFF',
          'off-white': '#EDEDED',
          'whatsapp-green': '#5FD568',
        },
      },
    },
  },
  plugins: [],
}; 