import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { getSiteConfig } from '../src/lib/site-config.ts';

const originalMode = process.env.SITE_MODE;
const originalUrl = process.env.SITE_URL;

beforeEach(() => {
  delete process.env.SITE_MODE;
  delete process.env.SITE_URL;
});

afterEach(() => {
  if (originalMode === undefined) delete process.env.SITE_MODE;
  else process.env.SITE_MODE = originalMode;
  if (originalUrl === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = originalUrl;
});

test('defaults to preview without inventing a public domain', () => {
  assert.deepEqual(getSiteConfig(), { mode: 'preview', siteUrl: null });
});

test('rejects an unknown site mode', () => {
  process.env.SITE_MODE = 'prodution';
  assert.throws(getSiteConfig, /SITE_MODE/);
});

test('requires a real HTTPS base URL for production', () => {
  process.env.SITE_MODE = 'production';
  assert.throws(getSiteConfig, /SITE_URL/);
  process.env.SITE_URL = 'http://example.com';
  assert.throws(getSiteConfig, /SITE_URL/);
  process.env.SITE_URL = 'https://example.com/';
  assert.deepEqual(getSiteConfig(), {
    mode: 'production',
    siteUrl: 'https://example.com',
  });
});

test('rejects malformed or credential-bearing base URLs', () => {
  for (const value of ['invalid', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com/?query=1']) {
    process.env.SITE_URL = value;
    assert.throws(getSiteConfig, /SITE_URL/);
  }
});
