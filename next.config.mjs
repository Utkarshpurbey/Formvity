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
      {
        source: "/welcome",
        destination: "/invite",
        permanent: false,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
