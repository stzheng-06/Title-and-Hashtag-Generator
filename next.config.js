/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // 增强生产环境错误处理
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // API路由超时设置（Vercel默认是10秒，但我们可以明确设置）
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },

  // 重定向和错误处理
  async rewrites() {
    return [];
  },
};

export default config;
