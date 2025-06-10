/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localeDetection: false,
  },

  images: {
    domains: ['127.0.0.1', 'varda.hellotree.dev','admin.varda.ag', 'picsum.photos', 'store.storeimages.cdn-apple.com', 'images.unsplash.com'],
  },

  experimental: {
    disableVercelToolbar: true,
  },

  env: {
    NEXT_DISABLE_VERCEL_TOOLBAR: '1',
  },
}

module.exports = nextConfig
