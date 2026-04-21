/** @type {import('next').NextConfig} */
const basePath = '/ticket'
const nextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  output: 'standalone',
}

module.exports = nextConfig
