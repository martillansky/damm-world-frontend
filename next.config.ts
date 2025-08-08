module.exports = {
  allowedDevOrigins: [
    "https://48c4-2800-560-1aa-a900-5c98-2a61-ef4d-5eea.ngrok-free.app",
    "https://*.48c4-2800-560-1aa-a900-5c98-2a61-ef4d-5eea.ngrok-free.app",
    "48c4-2800-560-1aa-a900-5c98-2a61-ef4d-5eea.ngrok-free.app",
    "*.48c4-2800-560-1aa-a900-5c98-2a61-ef4d-5eea.ngrok-free.app",
  ],
  // Improve caching and reduce hydration issues
  experimental: {
    optimizeCss: true,
  },
  // Add proper headers for caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};
