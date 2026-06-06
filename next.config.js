/** @type {import('next').NextConfig} */
// Rebuild trigger: fix basePath for GitHub Pages deployment
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