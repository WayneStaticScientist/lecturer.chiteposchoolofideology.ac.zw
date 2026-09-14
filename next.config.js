/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.100.142:9991/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
