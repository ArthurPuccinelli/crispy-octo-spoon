/** @type {import('next').NextConfig} */
const nextConfig = {
    // NEXT_PUBLIC_* vars are automatically exposed to the client in Next.js.
    // Keep config minimal and correct the external package name.
    experimental: {
        serverComponentsExternalPackages: ['@supabase/supabase-js'],
    },
    output: 'standalone',
};

export default nextConfig;
