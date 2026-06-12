/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local backend uploads (dev)
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      // Production
      { protocol: 'https', hostname: 'api.verdura.in', pathname: '/uploads/**' },
      // Common image CDNs used for product images
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: '*.wikimedia.org', pathname: '/**' },
    ],
  },
}
module.exports = nextConfig
