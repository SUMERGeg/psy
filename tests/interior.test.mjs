import assert from 'node:assert/strict';
import { test } from 'node:test';
import { siteContent } from '../src/content/site.ts';
import { getVisibleSiteContent, validatePublication } from '../src/content/validation.ts';
import { getSessionRows, faqGroups } from '../src/content/presentation.ts';

test('interior pages show explicit consultation examples and keep FAQ and education hidden', () => {
  const content = getVisibleSiteContent(siteContent, 'preview', null);
  assert.deepEqual(content.pages.map((page) => page.id), ['home', 'about', 'topics', 'sessions', 'relationships', 'self-esteem', 'notes']);
  assert.ok(content.pages.find((page) => page.id === 'topics').blocks.find((block) => block.id === 'publications'));
  assert.equal(content.topics.length, 2);
  assert.deepEqual(content.faq, []);
  assert.deepEqual(content.education, []);
  assert.deepEqual(getSessionRows(content.consultations).map((row) => row.id), ['format', 'duration', 'price', 'frequency', 'cancellation']);
});

test('session rows omit unknown fields while preserving a confirmed zero price', () => {
  const facts = { format: null, durationMinutes: 50, price: { amount: 0, currency: 'RUB' }, frequency: null, cancellationPolicy: null };
  const rows = getSessionRows(facts);
  assert.deepEqual(rows.map((row) => row.id), ['duration', 'price']);
  assert.equal(rows[0].value, '50 минут');
  assert.match(rows[1].value, /0/);
  assert.deepEqual(faqGroups.map((group) => group.id), ['before', 'process', 'organization', 'boundaries']);
});

test('FAQ ids must be stable, safe and unique before rendering disclosures', () => {
  const content = structuredClone(siteContent);
  const item = { id: 'first-session', question: 'Тестовый вопрос', answer: 'Только тестовый ответ', group: 'before', status: 'DEMO', confirmed: true, source: 'test-fixture' };
  content.faq = [item, { ...item }];
  assert.match(validatePublication(content, 'preview', null).join('\n'), /duplicate FAQ id/);
  content.faq = [{ ...item, id: 'invalid id' }];
  assert.match(validatePublication(content, 'preview', null).join('\n'), /stable FAQ id/);
});
