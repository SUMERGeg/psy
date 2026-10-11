import test from 'node:test';
import assert from 'node:assert/strict';
import { withBasePath, withoutBasePath } from '../src/lib/base-path.ts';

test('Pages assets use a prefix once; external URLs and localhost paths stay intact', () => {
  assert.equal(withBasePath('/images/portrait/anna-photo.webp', '/psy'), '/psy/images/portrait/anna-photo.webp');
  assert.equal(withBasePath('/psy/images/photo.webp', '/psy'), '/psy/images/photo.webp');
  assert.equal(withBasePath('https://example.org/photo.webp', '/psy'), 'https://example.org/photo.webp');
  assert.equal(withBasePath('//example.org/photo.webp', '/psy'), '//example.org/photo.webp');
  assert.equal(withBasePath('/images/photo.webp', ''), '/images/photo.webp');
});

test('animated router navigation strips only the exact app prefix and preserves fragments', () => {
  assert.equal(withoutBasePath('/psy/topics/#topic-self-esteem', '/psy'), '/topics/#topic-self-esteem');
  assert.equal(withoutBasePath('/psy', '/psy'), '/');
  assert.equal(withoutBasePath('/psy#conversation', '/psy'), '/#conversation');
  assert.equal(withoutBasePath('/psychology/', '/psy'), '/psychology/');
  assert.equal(withoutBasePath('/about', ''), '/about');
});
