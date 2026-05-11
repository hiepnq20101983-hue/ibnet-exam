import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '', // Typically /repository-name if deploying to subpath, but empty for root.
};

export default nextConfig;
