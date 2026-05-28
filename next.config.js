/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/election-map-2015',
  assetPrefix: '/election-map-2015/',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig