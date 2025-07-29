import React, { useEffect } from 'react';
import { isAndroidBrowser, isLegacyBrowser } from '@/utils/browser-detection';

export default function FallbackTheme() {
  useEffect(() => {
    if (isAndroidBrowser() || isLegacyBrowser()) {
      // Add fallback styles for older browsers
      const style = document.createElement('style');
      style.textContent = `
        /* Force light theme for older browsers */
        body {
          background-color: #ffffff !important;
          color: #070707 !important;
        }
        
        /* Override dark theme styles */
        .dark {
          background-color: #2a2a2a !important;
          color: #FFFFFF !important;
        }
        
        /* Ensure text is readable */
        p, h1, h2, h3, h4, h5, h6, span, div {
          color: inherit !important;
        }
        
        /* Ensure links are visible */
        a {
          color: #e73828 !important;
        }
        
        /* Ensure buttons are visible */
        button {
          background-color: #e73828 !important;
          color: #FFFFFF !important;
        }

        /* Ensure form elements are visible */
        input, select, textarea {
          background-color: #ffffff !important;
          color: #070707 !important;
          border: 1px solid #e5e7eb !important;
        }

        /* Ensure card backgrounds */
        .bg-background-light {
          background-color: #ffffff !important;
        }

        .bg-background-dark {
          background-color: #2a2a2a !important;
        }

        /* Ensure text colors */
        .text-app-black {
          color: #070707 !important;
        }

        .text-app-white {
          color: #FFFFFF !important;
        }

        .text-app-red {
          color: #e73828 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return null;
} 