import { Inter, Noto_Sans_Arabic } from 'next/font/google';

/**
 * Self-hosted via next/font instead of the render-blocking Google Fonts <link> that
 * used to live in _document.tsx — and unlike that link, this one is actually applied:
 * previously Inter was downloaded on every page load and never referenced by any
 * `font-family`, while `font-['Roboto']` (82 call sites) and `font-roboto` /
 * `font-nunito` (9 more) named a font that was never loaded and isn't defined in the
 * Tailwind config, so every page rendered in the browser's default sans-serif.
 *
 * Each font exposes a CSS variable (`--font-inter` / `--font-arabic`) consumed by
 * `fontFamily.sans` / `fontFamily.arabic` in tailwind.config.js. The variables are
 * put on <main> in _app.tsx; globals.css switches between them based on the `dir`
 * attribute _document.tsx already sets on <html>.
 */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});
