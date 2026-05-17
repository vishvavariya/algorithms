/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'export',
  basePath: '/algovision',
  assetPrefix: '/algovision/',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
