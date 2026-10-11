import type { NextConfig } from 'next';
import { getSiteConfig } from './src/lib/site-config';
import { siteContent } from './src/content/site.ts';
import { assertPublicationReady } from './src/content/publication.ts';

const site = getSiteConfig();
assertPublicationReady(siteContent, site.mode, site.siteUrl);
const pagesExport = process.env.GITHUB_PAGES === 'true';
const basePath = pagesExport ? '/psy' : '';

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  ...(pagesExport ? {
    output: 'export' as const,
    distDir: '.next-pages',
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(!pagesExport ? {
  async headers() {
    return site.mode === 'preview'
      ? [{
          source: '/:path*',
          headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
        }]
      : [];
  },
  } : {}),
};

export default nextConfig;
