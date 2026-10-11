import { rm, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { siteContent } from '../src/content/site.ts';
import { getVisibleSiteContent } from '../src/content/validation.ts';
import { getSiteConfig } from '../src/lib/site-config.ts';

const config = getSiteConfig();
const visible = new Set(getVisibleSiteContent(siteContent, config.mode, config.siteUrl).pages.map(page => page.path));
const exportRoot = resolve('.next-pages');
await stat(resolve(exportRoot, 'index.html'));
for (const page of siteContent.pages) {
  if (visible.has(page.path)) continue;
  const target = resolve(exportRoot, page.path.slice(1));
  const within = relative(exportRoot, target);
  if (!within || within.startsWith('..') || isAbsolute(within)) throw new Error('Unsafe hidden route export path');
  // Next exports notFound() as an HTML file; Pages would serve it with HTTP 200.
  await rm(target, { recursive: true, force: true });
  console.log(`Excluded hidden route ${page.path} from Pages artifact.`);
}
