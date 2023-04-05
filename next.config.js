/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const withPWA = require('next-pwa');

module.exports = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // reactStrictMode: true,
  disable: process.env.NODE_ENV === 'development',
});