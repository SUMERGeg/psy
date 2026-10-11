import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { renderAccordion } from '../helpers/accordion-render.mjs';

// Isolated QA fixture, never part of Next routes or application content.
const items = [
  { id: 'keyboard', question: 'Тест: раскрытие с клавиатуры', answer: 'Это технический пример. Он не описывает практику Анны.' },
  { id: 'long', question: 'Тест: длинный ответ на узком экране', answer: Array(8).fill('Длинный технический текст проверяет перенос строк и доступность раскрытия. Содержимое используется только в изолированной проверке компонента.').join('\n\n') },
];
const tokens = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../../src/components/ui/ui.module.css', import.meta.url), 'utf8');
const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Изолированная проверка FAQ</title><style>${tokens}${styles}:root{--font-serif:Georgia,serif;--font-sans:Arial,sans-serif}*{box-sizing:border-box}body{background:var(--color-paper);color:var(--color-ink);font:18px/1.65 Arial,sans-serif;margin:24px}main{max-width:800px;margin:auto}h1{font:32px/1.2 Georgia,serif}p{margin:0}:focus-visible{outline:var(--focus-ring);outline-offset:4px}</style><main><h1>Техническая проверка FAQ</h1><p>Тестовые данные — не контент сайта.</p>${renderAccordion(items)}</main></html>`;
createServer((request, response) => {
  if (request.url !== '/') { response.writeHead(404).end(); return; }
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "script-src 'none'", 'X-Robots-Tag': 'noindex, nofollow' }).end(html);
}).listen(3002, '127.0.0.1', () => console.log('Isolated disclosure QA: http://127.0.0.1:3002/ (scripts blocked)'));
