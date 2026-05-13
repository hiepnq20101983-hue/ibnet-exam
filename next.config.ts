import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  basePath: process.env.GITHUB_ACTIONS === 'true' ? '/ibnet-exam' : '', // Set repository name as basePath ONLY for GitHub Pages build
};

export default nextConfig;
