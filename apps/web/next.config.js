/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: '*.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'source.unsplash.com', pathname: '/**' },
      // Local backend uploads (dev)
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      // Production API domain
      { protocol: 'https', hostname: 'api.verdura.in', pathname: '/uploads/**' },
    ],
    // Browser & CDN cache optimised images for 24 h; serve modern formats
    minimumCacheTTL: 86400,
    formats: ['image/avif', 'image/webp'],
  },
  // Compiler optimisations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
}

module.exports = nextConfig
