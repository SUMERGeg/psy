import assert from 'node:assert/strict';
import { test } from 'node:test';

// Run against the optimized local preview: npm run build, then npm run start.
const origin = 'http://127.0.0.1:3000';
for (const [path, expectedStatus, title] of [
  ['/', 200, 'Анна Филиппова — психолог'],
  ['/about', 200, 'Обо мне — Анна Филиппова'],
  ['/topics', 200, 'Темы для разговора — Анна Филиппова'],
  ['/topics/relationships', 200, 'Отношения — Анна Филиппова'],
  ['/topics/self-esteem', 200, 'Самооценка — Анна Филиппова'],
  ['/notes', 200, 'Заметки — Анна Филиппова'],
  ['/sessions', 200, 'Консультации — Анна Филиппова'],
  ['/faq', 404, null],
]) {
  test(`optimized preview route ${path} returns ${expectedStatus}`, async () => {
    const response = await fetch(`${origin}${path}`);
    const html = await response.text();
    assert.equal(response.status, expectedStatus);
    assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/);
    assert.doesNotMatch(html, /\[TBD\]|ПОДТВЕРДИТЬ|7 лет практики|Супервизор, ОИПП/);
    if (title) {
      assert.ok(html.includes(`<title>${title}</title>`));
      assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
      assert.ok(html.includes('id="main-content"'));
      assert.doesNotMatch(html, /href="\/faq"/);
      assert.ok(html.includes('href="/sessions"'));
      assert.ok(html.includes('@anna_feell'));
      assert.doesNotMatch(html, /<button[^>]*aria-label="Скопировать/);
      if (path === '/') {
        assert.ok(html.includes('href="/topics#topic-relationships"'));
        assert.ok(html.includes('href="/topics#topic-self-esteem"'));
        for (const id of ['pause', 'attempt', 'rest']) assert.ok(html.includes(`href="/notes#note-${id}"`));
      }
      if (path === '/topics') {
        assert.ok(html.includes('id="topic-relationships"'));
        assert.ok(html.includes('id="topic-self-esteem"'));
        assert.ok(html.includes('href="/topics/relationships"'));
        assert.ok(html.includes('href="/topics/self-esteem"'));
      }
      assert.ok(html.includes('href="/notes"'));
      if (path === '/notes' || path.startsWith('/topics/')) {
        assert.ok(html.includes('Вопрос для себя'));
        assert.ok(html.includes('мин чтения'));
        const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
        assert.doesNotMatch(markup, /Редакционн|для макета|Не является публикацией или цитатой/);
        assert.doesNotMatch(html, /<img(?:\s|>)/);
        const links = [...html.matchAll(/href="(\/(?:topics\/(?:relationships|self-esteem)|notes))"/g)];
        for (const match of links) assert.equal((await fetch(`${origin}${match[1]}`)).status, 200);
      }
      if (path === '/notes') {
        for (const id of ['pause', 'attempt', 'rest']) {
          assert.ok(html.includes(`href="#note-${id}"`));
          assert.ok(html.includes(`id="note-${id}"`));
        }
      }
      if (path === '/sessions') {
        assert.ok(html.includes('50 минут'));
        assert.ok(html.includes('Онлайн, индивидуально'));
        assert.ok(html.includes('Записаться'));
      }
    }
  });
}
