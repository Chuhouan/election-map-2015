/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/uk-election-2015',
  assetPrefix: '/uk-election-2015/',
  allowedDevOrigins: ['localhost', '127.0.0.1', '*.csb.app'],
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig