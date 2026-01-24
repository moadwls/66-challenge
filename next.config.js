/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use static export only for Capacitor builds (npm run build:ios)
  // Vercel will use its own build process
  ...(process.env.BUILD_TARGET === 'capacitor' ? {
    output: 'export',
    trailingSlash: true,
  } : {}),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
