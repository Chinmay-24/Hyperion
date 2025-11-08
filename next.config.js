/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Handle IPFS client-side only (IPFS uses dynamic imports, so these may not be needed)
    // But include them as fallbacks for compatibility
    if (!isServer) {
      try {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          stream: require.resolve('stream-browserify'),
          crypto: require.resolve('crypto-browserify'),
        };
      } catch (e) {
        // If modules not found, continue without them
        console.warn('Some webpack fallbacks not available:', e.message);
      }
    }
    
    return config;
  },
};

module.exports = nextConfig;

