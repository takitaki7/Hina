/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Live web demo of the Dawn extension (static files in public/dawn).
      { source: "/dawn", destination: "/dawn/newtab.html" },
    ];
  },
};

export default nextConfig;
