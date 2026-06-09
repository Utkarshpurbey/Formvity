/** @type {import('next').NextConfig} */
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim();
const basePath =
  rawBase && rawBase !== "/"
    ? rawBase.replace(/\/+$/, "")
    : undefined;

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
