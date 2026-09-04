import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useAppTheme } from '@/hooks/use-app-theme';

/**
 * Replaced a 212-line CodePen-style toggle (~160 lines of styled-components CSS)
 * that declared `:root { --hue; --bg; --fg; ... }` *inside* the styled-component.
 * styled-components nests every selector under the generated component class
 * unless it's a global style, so that rule compiled to `.sc-xxxx :root { ... }`
 * — a selector that can never match anything, since :root (the <html> element)
 * is never a descendant of a <div>. `.container`'s `background-color: var(--bg)`
 * and `color: var(--fg)` therefore always resolved to nothing.
 *
 * This is a plain icon button using the app's real color tokens instead of an
 * isolated CSS-variable system of its own, consistent with `icon-button.tsx`'s
 * sizing and the header's other icon controls.
 */
const ThemeSwitcher = () => {
  const { theme, setTheme } = useAppTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className="flex items-center justify-center p-1.5 rounded-full text-app-red hover:bg-app-red/10 transition-colors"
    >
      {isDark ? (
        <SunIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
      ) : (
        <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
