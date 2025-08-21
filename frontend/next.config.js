/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
