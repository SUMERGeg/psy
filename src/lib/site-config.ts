export type SiteConfig = {
  mode: 'preview' | 'production';
  siteUrl: string | null;
};

export function getSiteConfig(): SiteConfig {
  const mode = process.env.SITE_MODE?.trim() || 'preview';

  if (mode !== 'preview' && mode !== 'production') {
    throw new Error('SITE_MODE must be preview or production.');
  }

  const rawUrl = process.env.SITE_URL?.trim();

  if (!rawUrl) {
    if (mode === 'production') {
      throw new Error('SITE_URL is required in production.');
    }
    return { mode, siteUrl: null };
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('SITE_URL must be a valid HTTPS base URL.');
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('SITE_URL must be an HTTPS base URL without credentials, path, query or fragment.');
  }

  return { mode, siteUrl: url.origin };
}
