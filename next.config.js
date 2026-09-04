/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  poweredByHeader: false,

  // The Pages Router SSR path for styled-components (still used by ~5 components:
  // notifications.tsx, theme-switcher.tsx, notification.tsx, google-button.tsx) is
  // _document.tsx's manual ServerStyleSheet. This flag is the missing piece that
  // makes styled-components' own SWC transform (displayName, minified class names,
  // css prop) actually run — previously the app also carried a *second*,
  // App-Router-shaped SSR registry (src/lib/registry.tsx, using
  // useServerInsertedHTML) wrapping the whole tree for no reason, since Pages
  // Router never calls that hook. It has been removed; this is the correct config
  // for the approach _document.tsx already uses.
  compiler: {
    styledComponents: true,
  },

  i18n: {
    locales: ["en", "ar"],
    defaultLocale: "en",
    localeDetection: false,
  },

  images: {
    // `unoptimized: true` was set here, which turned every <Image> into a plain
    // <img>: no WebP/AVIF, no responsive srcset, no resizing — full-resolution
    // uploads were served to phones, including full-bleed hero banners.
    //
    // The allowlist below was written and kept accurate for exactly this moment.
    // If a supplier ever serves images from a new host, add it here or next/image
    // will refuse it with a 400 rather than silently loading it.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "admin.bechaalanyconnect.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      // Supplier-hosted category artwork (Yassen serves absolute image URLs).
      { protocol: "https", hostname: "yassen-card.com" },
      { protocol: "https", hostname: "**.yassen-card.com" },
    ],
  },

  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_DISABLE_VERCEL_TOOLBAR: "1",
  },

  // Simplified webpack configuration
  webpack: (config) => {
    config.module = {
      ...config.module,
      rules: [
        ...(config.module?.rules || []),
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    };
    return config;
  },

  // Keep only stable experimental features
  experimental: {
    scrollRestoration: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
