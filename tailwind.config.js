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
  plugins: [
    /*
     * A real `rtl:` variant.
     *
     * `.rtl\:rotate-y-180` used to be registered as a PLAIN CLASS, not a variant — so
     * `className="rtl:rotate-y-180"` flipped the element in BOTH directions, English
     * included. And because no true variant existed, `rtl:` could not be used with any
     * other utility, which is why the codebase reaches for `locale === 'ar' ? … : …`
     * in markup instead.
     *
     * These key off [dir] on an ancestor, which only became correct once _document.tsx
     * started putting dir on <html> — before that, dir lived on <main> and anything
     * portalled outside it (toasts, fixed-position modals) was unreachable.
     */
    function ({ addUtilities, addVariant }) {
      addVariant('rtl', '[dir="rtl"] &');
      addVariant('ltr', '[dir="ltr"] &');

      addUtilities({
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
      });
    },
  ],
}; 