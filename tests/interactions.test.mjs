import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getInstagramHandle, getLightOffset, getTopicId, getTopicHref, tryCopyHandle, getReadingProgress } from '../src/lib/interactions.ts';
import { siteContent } from '../src/content/site.ts';

test('copy handle comes from a profile URL, not an unrelated site or post', () => {
  assert.equal(getInstagramHandle(siteContent.contacts.instagramUrl.value), '@anna_feell');
  for (const value of [null, 'https://example.org/anna_feell/', 'https://www.instagram.com/p/abc/', 'javascript:alert(1)']) assert.equal(getInstagramHandle(value), null);
});

test('light remains bounded even outside the hero or with an empty rectangle', () => {
  assert.deepEqual(getLightOffset(50, 50, { left: 0, top: 0, width: 100, height: 100 }), { x: 0, y: 0 });
  const edge = getLightOffset(1000, -100, { left: 0, top: 0, width: 100, height: 100 });
  assert.deepEqual(edge, { x: 18, y: -12 });
  assert.deepEqual(getLightOffset(-100, 1000, { left: 0, top: 0, width: 100, height: 100 }), { x: -18, y: 12 });
  assert.deepEqual(getLightOffset(1, 1, { left: 0, top: 0, width: 0, height: 0 }), { x: 0, y: 0 });
});

test('every home topic points to its own stable destination', () => {
  const targets = new Set();
  for (const topic of siteContent.topics) {
    const id = getTopicId(topic.slug);
    assert.equal(getTopicHref(topic.slug), `/topics#${encodeURIComponent(id)}`);
    assert.ok(!targets.has(id));
    targets.add(id);
  }
});

test('clipboard denial and unavailable API fail gracefully, success writes only the handle', async () => {
  let copied;
  assert.equal(await tryCopyHandle('@anna_feell', { writeText: async (value) => { copied = value; } }), true);
  assert.equal(copied, '@anna_feell');
  assert.equal(await tryCopyHandle('@anna_feell', { writeText: async () => { throw new Error('NotAllowedError'); } }), false);
  assert.equal(await tryCopyHandle('@anna_feell', undefined), false);
});

test('reading progress is bounded before/after the text, including short and empty ranges', () => {
  assert.equal(getReadingProgress(0, 200, 1200), 0);
  assert.equal(getReadingProgress(700, 200, 1200), 50);
  assert.equal(getReadingProgress(1800, 200, 1200), 100);
  assert.equal(getReadingProgress(199, 200, 200), 0);
  assert.equal(getReadingProgress(200, 200, 200), 100);
  assert.equal(getReadingProgress(250, 200, 100), 100);
});
