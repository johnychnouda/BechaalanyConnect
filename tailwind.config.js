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
          'red-hover': '#d63224',
          black: '#070707',
          white: '#FFFFFF',
          'off-white': '#EDEDED',
          'whatsapp-green': '#5FD568',
        },
        // Named versions of the neutral hexes already hardcoded across the app
        // (#F7F7F7 / #E0E0E0 / #8E8E8E), so new and migrated code shares one
        // source instead of re-typing the literal.
        neutral: {
          50: '#F7F7F7',
          200: '#E0E0E0',
          400: '#8E8E8E',
        },
      },
      fontFamily: {
        // Populated by next/font in _app.tsx via CSS variables — see src/lib/fonts.ts.
        // The system stack is the fallback while a font is loading / if it fails.
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // New named steps that reproduce the ad-hoc `rounded-[Npx]` values already in
      // use, so call sites can be migrated onto a shared scale as a visual no-op
      // rather than picking new numbers.
      borderRadius: {
        btn: '25px',   // buttons/pills, e.g. header.tsx CTAs
        modal: '20px', // modal.tsx panel
        panel: '32px', // dashboard-layout.tsx card
      },
      boxShadow: {
        card: '0 4px 4px 0 rgba(0,0,0,0.1)', // header.tsx sticky-bar shadow, reused for cards
      },
      screens: {
        // Promotes the hand-written `@media (max-width: 400px)` / `340px` blocks in
        // globals.css to real Tailwind utilities instead of bespoke CSS.
        xs: '400px',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
