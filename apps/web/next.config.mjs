/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Allow @shared package resolution
  transpilePackages: ["@gpt-erp/shared"],
};

export default nextConfig;
