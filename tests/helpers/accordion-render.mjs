import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Test-only TSX rendering with the project's existing compiler, no browser driver.
const filename = fileURLToPath(new URL('../../src/components/ui/Accordion.tsx', import.meta.url));
const require = createRequire(filename);
const output = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const testModule = { exports: {} };
runInNewContext(output, { exports: testModule.exports, module: testModule, require: (id) => id.endsWith('.module.css') ? new Proxy({}, { get: (_, key) => key === '__esModule' ? false : key }) : require(id) });

export function renderAccordion(items) {
  return renderToStaticMarkup(createElement(testModule.exports.Accordion, { items }));
}
