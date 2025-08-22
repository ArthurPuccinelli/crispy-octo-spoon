/** @type {import('next').NextConfig} */
// Last updated: 2024-01-XX - Fixed for Netlify compatibility
// Using .mjs extension for maximum compatibility

const nextConfig = {
    // Ensure environment variables are available at build time
    env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },

    // Enable experimental features if needed
    experimental: {
        // Enable if you need server components with client-side data fetching
        serverComponentsExternalPackages: ['@supabase/supabase-js'],
    },

    // Debug: Log environment variables during build
    onDemandEntries: {
        // Add build-time logging
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 2,
    },
};

export default nextConfig;
