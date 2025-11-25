import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Static export (html)
    output: 'export',
    devIndicators: {
        buildActivity: false,
    },
    // envs
    env: {
        API_BASE_URL: process.env.API_BASE_URL,
        ENVIRONMENT: process.env.ENVIRONMENT,
    },

    // Required if using `next/image` with static export
    images: {
        unoptimized: true,
    },
    typescript: {
        // ❗ Build will succeed even if there are TypeScript errors
        ignoreBuildErrors: true,
    },
    eslint: {
        // ❗ Build will succeed even if there are ESLint errors
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
