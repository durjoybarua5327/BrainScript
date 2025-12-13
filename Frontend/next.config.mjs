import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.convex.cloud',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
        ],
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "@/convex": path.resolve(__dirname, "../Backend/convex"),
        };
        return config;
    },
};

export default nextConfig;
