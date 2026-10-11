import { siteContent } from '../src/content/site.ts';
import { assertPublicationReady } from '../src/content/publication.ts';
import { getSiteConfig } from '../src/lib/site-config.ts';

try {
  const config = getSiteConfig();
  assertPublicationReady(siteContent, config.mode, config.siteUrl);
  console.log(`Content check passed (${config.mode}).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
