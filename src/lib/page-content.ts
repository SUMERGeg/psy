import { notFound } from 'next/navigation';
import { siteContent } from '@/content/site';
import { getVisibleSiteContent } from '@/content/validation';
import type { PageId } from '@/content/types';
import { getSiteConfig } from './site-config';

export function getPageData(id: PageId) {
  const config = getSiteConfig();
  const content = getVisibleSiteContent(siteContent, config.mode, config.siteUrl);
  const page = content.pages.find((page) => page.id === id);
  if (!page) notFound();
  return { page, content };
}

export function getPageMetadata(id: PageId) {
  const { page } = getPageData(id);
  return { title: page.metadata.title, description: page.metadata.description };
}
