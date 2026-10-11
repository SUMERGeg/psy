import { statSync } from 'node:fs';
import { join } from 'node:path';
import type { SiteContent, SiteMode } from './types';
import { validatePublication } from './validation.ts';

// Filesystem checks belong to the build gate, not the pure content model.
export function assertPublicationReady(content: SiteContent, mode: SiteMode, siteUrl: string | null): void {
  const errors = validatePublication(content, mode, siteUrl);
  if (!errors.length) {
    for (const id of content.usedAssetIds) {
      const asset = content.assets.find((asset) => asset.id === id)!;
      try {
        if (!statSync(join(process.cwd(), 'public', asset.path!.slice(1))).isFile()) {
          errors.push(`assets.${id}: image file is not a regular file`);
        }
      } catch {
        errors.push(`assets.${id}: image file is missing or inaccessible`);
      }
    }
  }
  if (errors.length) throw new Error(`Content publication blocked (${mode}):\n- ${errors.join('\n- ')}`);
}
