import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getReadingTimeLabel } from '../src/lib/reading-time.ts';
import { siteContent } from '../src/content/site.ts';
import { getVisibleSiteContent } from '../src/content/validation.ts';

test('reading estimate handles Cyrillic, punctuation, paragraphs and minute boundaries', () => {
  assert.equal(getReadingTimeLabel([]), 'Около 1 мин чтения');
  assert.equal(getReadingTimeLabel(['— «…»\n']), 'Около 1 мин чтения');
  assert.equal(getReadingTimeLabel(Array(180).fill('что-то')), 'Около 1 мин чтения');
  assert.equal(getReadingTimeLabel(['слово\n'.repeat(180), 'Ещё']), 'Около 2 мин чтения');
});

test('demo reader copy has no internal caveats and keeps unresolved professional facts hidden', () => {
  const content = getVisibleSiteContent(siteContent, 'preview', null);
  const readerCopy = content.pages.flatMap((page) => [page.metadata.title, page.metadata.description,
    ...page.blocks.flatMap((block) => [block.title, ...block.body])]);
  readerCopy.push(content.conversation.attribution);
  assert.doesNotMatch(readerCopy.join('\n'), /Редакционн|для макета|для демонстрации|не подтвержден|ПОДТВЕРДИТЬ|\[TBD\]/i);
  assert.deepEqual(content.consultations.price, siteContent.consultations.price.demo.value);
  assert.equal(content.specialist.method, null);
  assert.equal(content.contacts.bookingUrl, siteContent.contacts.bookingUrl.demo.value);
  const notes = content.pages.find((page) => page.id === 'notes');
  const items = notes.blocks.filter((block) => !['intro', 'reflection'].includes(block.id));
  assert.deepEqual(items.map((block) => block.id), ['pause', 'attempt', 'rest']);
  assert.ok(items.every((block) => block.status === 'DEMO'));
});
