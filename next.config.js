/** @type {import('next').NextConfig} */
const basePath = '/ticket2'
const nextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  output: 'standalone',
}

module.exports = nextConfig
