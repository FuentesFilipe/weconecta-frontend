import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Static export (html)
    output: 'export',

    // envs
    env: {
        API_BASE_URL: process.env.API_BASE_URL,
        ENVIRONMENT: process.env.ENVIRONMENT
    },

    // Required if using `next/image` with static export
    images: {
        unoptimized: true
    }
};

export default nextConfig;
