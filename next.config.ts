import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['192.168.100.27', 'localhost', '127.0.0.1'],
  experimental: {
    turbopackPluginRuntimeStrategy: 'forceWorkerThreads' as any,
  },
  images: {
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'sabaichha.com',
      },
      {
        protocol: 'https',
        hostname: '*.sabaichha.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // 1. Clickjacking protection: Prevent embedding in cross-origin frames
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // 2. MIME sniffing protection: Force browsers to adhere to declared content-type
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // 3. Referrer privacy: Don't leak full URLs on cross-origin requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 4. Feature / Permissions policy: Disallow sensitive device hardware access
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // 5. Strict Transport Security: Force HTTPS in production (2 years duration + subdomains)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // 6. DNS Prefetch Control: Safely control DNS prefetching
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // 7. Cross-Origin Opener Policy: Protects against cross-window leaks while allowing share popups
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          // 8. Content Security Policy: Restrict framing, base-uri, form-action, and legacy object plugins
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
