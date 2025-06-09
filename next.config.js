/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle Node.js modules that aren't available in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
      
      // Handle specific issues with hardware wallet libraries
      config.externals = config.externals || [];
      config.externals.push({
        'usb': 'usb',
        'node-hid': 'node-hid',
      });
    }
    
    return config;
  },
  // Enable experimental features needed for hardware wallets
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig; 