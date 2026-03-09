import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // This allows Next.js to process and display images from external servers
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.weserv.nl",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.fna.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;