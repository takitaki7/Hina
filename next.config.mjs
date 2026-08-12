/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Serve the Dawn extension's static page (public/dawn) as the whole site.
    // beforeFiles runs ahead of the app router, so the root URL itself renders
    // Dawn without a redirect.
    return {
      beforeFiles: [
        { source: "/", destination: "/dawn/newtab.html" },
        { source: "/dawn", destination: "/dawn/newtab.html" },
      ],
    };
  },
};

export default nextConfig;
