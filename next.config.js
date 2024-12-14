const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

const withPWA = require("@ducanh2912/next-pwa").default({
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  dest: "public",
  fallbacks: {
    //image: "/static/images/fallback.png",
    document: "/offline", // if you want to fallback to a custom page rather than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
  workboxOptions: {
    disableDevLogs: true,
  },
  // ... other options you like
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      // @see https://github.com/WalletConnect/walletconnect-monorepo/issues/1908#issuecomment-1487801131
      config.resolve.fallback = { fs: false };
      config.externals.push('pino-pretty', 'lokijs')
      return config
    },
    reactStrictMode: true
  }
  
  module.exports = withPWA(withNextIntl(nextConfig))
  