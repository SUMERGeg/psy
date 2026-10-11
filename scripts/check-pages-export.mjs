import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const routes = ['', 'about', 'topics', 'sessions', 'notes', 'topics/relationships', 'topics/self-esteem'];
const basePath = '/psy';
const exportDirectory = '.next-pages';
let checked = 0;
for (const route of routes) {
  const html = await readFile(join(exportDirectory, route, 'index.html'), 'utf8');
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(html.includes('href="/psy/sessions/"'));
  for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    assert.ok(url === basePath || url.startsWith(`${basePath}/`), `Unprefixed URL in ${route}: ${url}`);
    const local = decodeURIComponent(url.slice(basePath.length).split(/[?#]/)[0]);
    const file = local.endsWith('/') ? `${local}index.html` : local;
    await stat(join(exportDirectory, file));
    checked++;
  }
}
await stat(join(exportDirectory, '404.html'));
console.log(`Pages export passed: ${routes.length} routes, ${checked} local links/assets, noindex and 404.`);
