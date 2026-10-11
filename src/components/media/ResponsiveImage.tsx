import Image from 'next/image';
import { siteContent } from '@/content/site';
import { getVisibleSiteContent } from '@/content/validation';
import { getSiteConfig } from '@/lib/site-config';
import styles from './media.module.css';
import { withBasePath } from '@/lib/base-path';

export function ResponsiveImage({ assetId, className, priority = false }: {
  assetId: string; className?: string; priority?: boolean;
}) {
  const config = getSiteConfig();
  const content = getVisibleSiteContent(siteContent, config.mode, config.siteUrl);
  const asset = content.assets.find((item) => item.id === assetId);
  if (!asset?.path || !asset.width || !asset.height) {
    throw new Error(`Image asset ${assetId} is not selected for this site mode.`);
  }
  return <Image
    src={withBasePath(asset.path)} width={asset.width} height={asset.height}
    alt={asset.alt} sizes={asset.sizes} preload={priority}
    className={[styles.image, className].filter(Boolean).join(' ')}
    style={{ objectPosition: `${asset.focalPoint.x}% ${asset.focalPoint.y}%` }}
  />;
}
