/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you need to use the same env var names as Vite
  env: {
    API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
