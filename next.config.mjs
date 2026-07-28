/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Static export configuration for kiosk deployment.
   * Run `npm run export` to generate a fully static `out/` directory
   * that can be served by any static file server or loaded directly
   * in a kiosk browser / Electron wrapper.
   *
   * Note: `next start` (Node server) also works for non-static deployments.
   */

  // Uncomment the line below to enable full static export:
  // output: "export",

  // Image optimisation is disabled in static-export mode.
  // Comment out if using `output: "export"`.
  images: {
    // Allow any localhost or relative paths used in kiosk mode
    remotePatterns: [],
  },
};

export default nextConfig;
