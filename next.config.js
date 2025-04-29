// Using CommonJS format instead of ESM
module.exports = {
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,

  // Disable features that might use critters
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization settings
  images: {
    unoptimized: true,
    domains: ["raw.githubusercontent.com"],
  },

  // Disable all CSS optimization
  optimizeFonts: false,

  // Experimental features
  experimental: {
    // Explicitly disable critters
    critters: false,
    optimizeCss: false,
  },

  // Disable powered by header
  poweredByHeader: false,

  // Increase build output detail for debugging
  output: "standalone",
}
