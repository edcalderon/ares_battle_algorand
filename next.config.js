const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
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
  