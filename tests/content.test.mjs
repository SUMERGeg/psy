import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getVisibleBlocks, getVisibleSiteContent, validatePublication } from '../src/content/validation.ts';
import { conversationContent } from '../src/content/conversation.ts';

// Synthetic approved fixture, never imported by the application.
const fact = (value) => ({ value, confirmed: true, source: 'test-fixture' });
const unknown = () => ({ value: null, confirmed: false, source: 'test-fixture' });
function readyContent() {
  return {
    specialist: {
      name: fact('Имя специалиста'), role: fact('Психолог'),
      practiceExperience: unknown(), supervision: unknown(), method: unknown(),
      audience: unknown(), boundaries: unknown(), city: unknown(),
    },
    consultations: {
      format: fact('Онлайн'), durationMinutes: fact(50), price: fact({ amount: 4000, currency: 'RUB' }),
      frequency: unknown(), cancellationPolicy: unknown(),
    },
    contacts: { bookingUrl: fact('https://example.org/contact'), instagramUrl: fact('https://www.instagram.com/test/'), email: unknown() },
    pages: ['home', 'about', 'topics', 'sessions', 'faq'].map((id) => ({
      id, path: id === 'home' ? '/' : `/${id}`, enabled: true,
      metadata: { status: 'APPROVED', title: 'Заголовок страницы', description: 'Описание страницы', source: 'test-fixture' },
      blocks: [{ id: `${id}-intro`, status: 'APPROVED', required: true, title: 'Заголовок', body: ['Согласованный текст'], source: 'test-fixture', factKeys: [] }],
    })),
    topics: [{ slug: 'relationships', title: 'Отношения', description: '', order: 1, status: 'APPROVED', confirmed: true, source: 'test-fixture' }],
    faq: [{ id: 'first', question: 'Как проходит встреча?', answer: 'Согласованный ответ', group: 'before', status: 'APPROVED', confirmed: true, source: 'test-fixture' }],
    education: [], assets: [], usedAssetIds: [],
  };
}
const errors = (content, mode = 'preview', url = null) => validatePublication(content, mode, url).join('\n');

test('demo facts show only in preview and never satisfy production requirements', () => {
  const content = readyContent();
  content.consultations.frequency = { ...unknown(), demo: { value: 'Раз в неделю', source: 'test-fixture' } };
  assert.equal(getVisibleSiteContent(content, 'preview', null).consultations.frequency, 'Раз в неделю');
  assert.equal(getVisibleSiteContent(content, 'production', 'https://example.org').consultations.frequency, null);
  content.contacts.bookingUrl = { ...unknown(), demo: { value: 'https://example.org/contact', source: 'test-fixture' } };
  content.consultations.price = { ...unknown(), demo: { value: { amount: 4000, currency: 'RUB' }, source: 'test-fixture' } };
  content.pages[3].blocks[0].factKeys = ['contacts.bookingUrl', 'consultations.price'];
  assert.equal(errors(content), '');
  assert.match(errors(content, 'production', 'https://example.org'), /contacts.bookingUrl/);
  assert.match(errors(content, 'production', 'https://example.org'), /consultations.price/);
});

test('preview examples are validated and a confirmed fact takes precedence', () => {
  const content = readyContent();
  content.contacts.bookingUrl = { ...unknown(), demo: { value: 'javascript:alert(1)', source: 'test-fixture' } };
  content.consultations.durationMinutes = { ...unknown(), demo: { value: 0, source: 'test-fixture' } };
  assert.match(errors(content), /contacts.bookingUrl.demo/);
  assert.match(errors(content), /consultations.durationMinutes/);
  content.contacts.bookingUrl = { ...fact('https://example.org/real'), demo: { value: 'https://example.org/demo', source: 'test-fixture' } };
  content.consultations.durationMinutes = { ...fact(60), demo: { value: 50, source: 'test-fixture' } };
  const view = getVisibleSiteContent(content, 'preview', null);
  assert.equal(view.contacts.bookingUrl, 'https://example.org/real');
  assert.equal(view.consultations.durationMinutes, 60);
});

test('production projection only includes explicitly approved conversation content', () => {
  const content = readyContent();
  for (const status of ['DEMO', 'DRAFT']) {
    content.conversation = { ...structuredClone(conversationContent), status };
    assert.equal(getVisibleSiteContent(content, 'production', 'https://example.org').conversation, null);
  }
  content.conversation.status = 'APPROVED';
  assert.equal(getVisibleSiteContent(content, 'production', 'https://example.org').conversation.status, 'APPROVED');
});

test('shows DEMO only in preview and never exposes DRAFT', () => {
  const blocks = ['DRAFT', 'DEMO', 'APPROVED'].map((status) => ({ id: status, status, required: false, title: 'Текст', body: [], source: 'test-fixture', factKeys: [] }));
  assert.deepEqual(getVisibleBlocks(blocks, 'preview').map((block) => block.id), ['DEMO', 'APPROVED']);
  assert.deepEqual(getVisibleBlocks(blocks, 'production').map((block) => block.id), ['APPROVED']);
});

test('allows an Instagram demonstration without booking or consultation conditions', () => {
  const content = readyContent();
  content.contacts.bookingUrl = unknown();
  content.consultations.format = unknown();
  content.consultations.durationMinutes = unknown();
  content.consultations.price = unknown();
  assert.equal(errors(content), '');
  assert.match(errors(content, 'production', 'https://example.org'), /contacts.bookingUrl/);
});

test('rejects unsafe contacts instead of using them as links', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', '#', 'http://example.org', 'https://user:pass@example.org']) {
    const content = readyContent();
    content.contacts.instagramUrl = fact(value);
    assert.match(errors(content), /contacts.instagramUrl/);
  }
});

test('rejects placeholders in visible copy and metadata but allows hidden drafts', () => {
  for (const marker of ['[TBD]', 'TODO', '[НУЖНО ПОДТВЕРДИТЬ]', '[ПОДТВЕРДИТЬ]', 'Lorem ipsum', '[Город]']) {
    const content = readyContent();
    content.pages[0].blocks[0].body = [marker];
    assert.match(errors(content), /home.*body/);
    content.pages[0].blocks[0].status = 'DRAFT';
    assert.equal(errors(content), '');
    content.pages[0].metadata.description = marker;
    assert.match(errors(content), /metadata.description/);
  }
});

test('requires an approved minimum on all five production pages and approved metadata', () => {
  const content = readyContent();
  assert.equal(errors(content, 'production', 'https://example.org'), '');
  content.pages[1].enabled = false;
  content.pages[2].blocks[0].status = 'DEMO';
  content.pages[3].metadata.status = 'DRAFT';
  assert.match(errors(content, 'production', 'https://example.org'), /pages.about/);
  assert.match(errors(content, 'production', 'https://example.org'), /pages.topics/);
  assert.match(errors(content, 'production', 'https://example.org'), /pages.sessions.metadata/);
  content.pages = content.pages.filter((page) => page.id !== 'faq');
  assert.match(errors(content, 'production', 'https://example.org'), /pages.faq/);
});

test('requires confirmed production conditions and a valid public origin', () => {
  const content = readyContent();
  for (const value of [null, 'javascript:alert(1)', 'http://example.org', 'https://example.org/path']) {
    assert.match(errors(content, 'production', value), /SITE_URL/);
  }
  content.consultations.format.confirmed = false;
  content.consultations.durationMinutes.value = 0;
  content.consultations.price.value.currency = '';
  const result = errors(content, 'production', 'https://example.org');
  assert.match(result, /consultations.format/);
  assert.match(result, /consultations.durationMinutes/);
  assert.match(result, /consultations.price/);
});

test('blocks visible assertions without a source or with unresolved supporting facts', () => {
  const content = readyContent();
  content.pages[0].blocks[0].factKeys = ['specialist.method'];
  assert.match(errors(content), /specialist.method/);
  content.pages[0].blocks[0].factKeys = ['specialist.nonexistent'];
  assert.match(errors(content), /specialist.nonexistent/);
  content.pages[0].blocks[0].factKeys = [];
  content.pages[0].blocks[0].source = '';
  assert.match(errors(content), /source/);
  content.faq[0].confirmed = false;
  assert.match(errors(content), /faq.first/);
});

test('validates only used images and requires files, dimensions and publication permission', () => {
  const content = readyContent();
  const asset = { id: 'portrait', path: null, width: null, height: null, alt: 'Портрет', sizes: '100vw', focalPoint: { x: 50, y: 50 }, source: 'test-fixture', demoSelected: false, publicationApproved: false };
  content.assets = [asset];
  assert.equal(errors(content), '');
  content.usedAssetIds = ['portrait'];
  assert.match(errors(content), /assets.portrait/);
  asset.path = '/images/portrait.webp'; asset.width = 800; asset.height = 1000; asset.demoSelected = true;
  assert.equal(errors(content), '');
  assert.match(errors(content, 'production', 'https://example.org'), /publicationApproved/);
  asset.publicationApproved = true;
  assert.equal(errors(content, 'production', 'https://example.org'), '');
  asset.path = '/docs/project/sources/instagram/screenshot.jpg';
  assert.match(errors(content), /path/);
  asset.path = '/images/../screenshot.jpg';
  assert.match(errors(content), /path/);
  content.usedAssetIds = ['missing'];
  assert.match(errors(content), /assets.missing/);
});
