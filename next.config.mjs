/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["react-toastify"],
  },
  async redirects() {
    return [
      {
        source: "/builder/v2",
        destination: "/builder",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
