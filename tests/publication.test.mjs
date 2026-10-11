import assert from 'node:assert/strict';
import { test } from 'node:test';
import { siteContent } from '../src/content/site.ts';
import { getVisibleSiteContent, validatePublication } from '../src/content/validation.ts';
import { getVisibleNavigation } from '../src/content/navigation.ts';

test('current demonstration exposes known profile data without unfinished pages or claims', () => {
  const view = getVisibleSiteContent(siteContent, 'preview', null);
  assert.equal(view.specialist.name, 'Анна Филиппова');
  assert.equal(view.specialist.method, null);
  assert.equal(view.specialist.practiceExperience, null);
  assert.equal(view.specialist.supervision, null);
  assert.equal(view.contacts.bookingUrl, siteContent.contacts.bookingUrl.demo.value);
  assert.equal(view.contacts.instagramUrl, 'https://www.instagram.com/anna_feell/');
  assert.deepEqual(view.consultations.price, siteContent.consultations.price.demo.value);
  assert.deepEqual(view.pages.map((page) => page.path), ['/', '/about', '/topics', '/sessions', '/topics/relationships', '/topics/self-esteem', '/notes']);
  assert.deepEqual(getVisibleNavigation(view).map((item) => item.href), ['/about', '/topics', '/notes', '/sessions']);
  assert.deepEqual(view.assets.map((asset) => asset.id), ['A01']);
  assert.equal(view.assets[0].publicationApproved, false);
  assert.match(view.assets[0].source, /docs\/design\/portrait-photo/);
  assert.deepEqual(view.faq, []);
  assert.deepEqual(view.education, []);
});

test('home uses one preview portrait and consultation examples remain unconfirmed', () => {
  const view = getVisibleSiteContent(siteContent, 'preview', null);
  const home = view.pages.find((page) => page.id === 'home');
  assert.equal(home.blocks.find((block) => block.id === 'hero').title, 'Отношения и самооценка');
  assert.ok(home.blocks.find((block) => block.id === 'introduction'));
  assert.deepEqual(siteContent.usedAssetIds, ['A01']);
  assert.equal(view.consultations.durationMinutes, 50);
  assert.equal(view.consultations.format, 'Онлайн, индивидуально');
  assert.equal(siteContent.consultations.durationMinutes.confirmed, false);
  assert.equal(siteContent.consultations.durationMinutes.value, null);
  assert.match(validatePublication(siteContent, 'production', 'https://example.org').join('\n'), /assets.A01.*publicationApproved/);
});

test('hidden internal copy is absent from data handed to page components', () => {
  const content = structuredClone(siteContent);
  content.pages[0].blocks.push({ id: 'internal', status: 'DRAFT', required: false, title: '[TBD]', body: ['SECRET-DRAFT'], source: 'test-fixture', factKeys: [] });
  const result = JSON.stringify(getVisibleSiteContent(content, 'preview', null));
  assert.doesNotMatch(result, /SECRET-DRAFT|TBD|Супервизор|7 лет практики/);
});

test('current demonstration cannot be promoted to production merely by setting a domain', () => {
  assert.throws(() => getVisibleSiteContent(siteContent, 'production', 'https://example.org'), /contacts.bookingUrl/);
});

test('build gate rejects a selected image whose actual file is missing', async () => {
  const { assertPublicationReady } = await import('../src/content/publication.ts');
  const content = structuredClone(siteContent);
  content.usedAssetIds = ['A01'];
  Object.assign(content.assets[0], { path: '/images/nonexistent-test-image.webp', width: 800, height: 1000, alt: 'Портрет', sizes: '100vw', demoSelected: true });
  assert.throws(() => assertPublicationReady(content, 'preview', null), /assets.A01.*file/);
});
