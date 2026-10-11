import assert from 'node:assert/strict';
import { test } from 'node:test';
import { siteContent } from '../src/content/site.ts';
import { getVisibleSiteContent, validatePublication } from '../src/content/validation.ts';
import { getVisibleNavigation } from '../src/content/navigation.ts';

const ids = ['relationships', 'self-esteem', 'notes'];
test('editorial pages preserve internal provenance and offer reader reflections on safe routes', () => {
  const visible = getVisibleSiteContent(siteContent, 'preview', null);
  const pages = visible.pages.filter((page) => ids.includes(page.id));
  assert.deepEqual(pages.map((page) => page.path), ['/topics/relationships', '/topics/self-esteem', '/notes']);
  for (const page of pages) {
    assert.equal(page.metadata.status, 'DEMO');
    assert.ok(page.blocks.length >= 4);
    assert.ok(page.blocks.every((block) => block.status === 'DEMO' && block.source.includes('editorial')));
    assert.ok(page.blocks.some((block) => block.id === 'reflection' && block.body[0].endsWith('?')));
  }
  const nav = getVisibleNavigation(visible);
  assert.ok(nav.some((item) => item.href === '/notes'));
  assert.ok(!nav.some((item) => item.href === '/topics/relationships'));
  const withoutNotes = {...visible, pages: visible.pages.filter((page) => page.id !== 'notes')};
  assert.ok(!getVisibleNavigation(withoutNotes).some((item) => item.href === '/notes'));
});

test('editorial drafts cannot become public by enabling routes or changing their path', () => {
  const errors = validatePublication(siteContent, 'production', 'https://example.org');
  for (const id of ids) assert.ok(errors.some((error) => error.includes(`pages.${id}.metadata`)));
  const content = structuredClone(siteContent);
  const notes = content.pages.find((page) => page.id === 'notes');
  assert.ok(notes);
  notes.path = '/unregistered';
  assert.ok(validatePublication(content, 'preview', null).some((error) => error.includes('pages.notes.path')));
});
