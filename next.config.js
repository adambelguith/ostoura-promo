/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost','res.cloudinary.com'],
  },
  // Serve static files from the uploads directory
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/*', // Ensure correct MIME type for images
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
