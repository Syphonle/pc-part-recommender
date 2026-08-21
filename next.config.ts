import type { NextConfig } from "next";

const repoName = "pc-part-recommender";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves a project site at <username>.github.io/<repo-name>/, so every
  // asset/link needs that prefix baked in at build time.
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
