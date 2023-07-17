import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
let nextConfig = {
  reactStrictMode: true,
}

const wrappers = [
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  }),
]
for (const wrapper of wrappers) {
  nextConfig = wrapper(nextConfig)
}

export default nextConfig
