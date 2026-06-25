/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Native modules yang tidak bisa di-bundle webpack
  serverExternalPackages: ["argon2", "@prisma/client", "prisma"],
  transpilePackages: ["@gpt-erp/shared"],
};

export default nextConfig;