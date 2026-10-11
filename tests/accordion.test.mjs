import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderAccordion } from './helpers/accordion-render.mjs';

test('SSR accordion is native, initially closed and escapes answer text', () => {
  const html = renderAccordion([{ id: 'first-session', question: 'Вопрос', answer: '<script>test</script>\n\nВторой абзац' }]);
  assert.match(html, /<details id="faq-first-session">/);
  assert.match(html, /<summary>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<p>Второй абзац<\/p>/);
  assert.doesNotMatch(html, /aria-expanded| open=|<script>/);
  assert.equal(renderAccordion([]), '');
});
