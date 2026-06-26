/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

module.exports = nextConfig;
