/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all features that might use critters
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Completely disable all CSS optimization
  optimizeFonts: false,
  experimental: {
    // Remove any CSS optimization features
    optimizeCss: false,
    // Explicitly disable critters
    critters: false,
    // Disable other experimental features that might cause issues
    scrollRestoration: false,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
