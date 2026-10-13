/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Browser /api/... bulata hai, Next use backend (port 4000) tak pahuncha deta hai.
    // Isse cookie same-origin rehti hai aur CORS ka jhanjhat nahi.
    async rewrites() {
        return [{ source: "/api/:path*", destination: `${process.env.API_URL ?? "http://localhost:4000"}/:path*` }];
    },
};
export default nextConfig;