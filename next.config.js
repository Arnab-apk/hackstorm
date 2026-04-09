/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongodb', '@noble/hashes', '@noble/ed25519'],
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

module.exports = nextConfig;
