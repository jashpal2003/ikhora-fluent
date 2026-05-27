/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  transpilePackages: ['@ikhora/shared', '@ikhora/database'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.blob.core.windows.net' },
      { protocol: 'https', hostname: '**.openai.azure.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // livekit-server-sdk uses Node.js built-ins — exclude from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
