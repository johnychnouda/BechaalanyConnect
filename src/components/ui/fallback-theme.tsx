import React, { useEffect } from 'react';
import { isLegacyBrowser } from '@/utils/browser-detection';

/**
 * This used to also fire on `isAndroidBrowser()` — any Android browser that isn't
 * Chrome/Samsung Internet — and, on top of a readability floor, forced light theme
 * globally (defeating dark mode for that entire segment with no documented reason
 * class-based `dark:` theming doesn't already handle) AND set
 * `button { background-color: #e73828 !important }` on every `<button>` on the page.
 * That single rule would silently override every variant of the new `Button`
 * primitive (secondary/outline/ghost) on any matching browser, so it's removed
 * along with the forced-light override; only a body-level readability floor
 * remains, scoped to engines old enough that CSS custom properties or the
 * `class`-based dark-mode strategy may not be reliable (IE, Android 4/5 WebView).
 */
export default function FallbackTheme() {
  useEffect(() => {
    if (isLegacyBrowser()) {
      const style = document.createElement('style');
      style.textContent = `
        body {
          background-color: #ffffff;
          color: #070707;
        }

        .dark body {
          background-color: #2a2a2a;
          color: #FFFFFF;
        }

        a {
          color: #e73828;
        }

        input, select, textarea {
          background-color: #ffffff;
          color: #070707;
          border: 1px solid #e5e7eb;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return null;
} 