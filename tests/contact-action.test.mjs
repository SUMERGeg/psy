import assert from 'node:assert/strict';
import test from 'node:test';
import { getContactAction } from '../src/lib/contact-action.ts';
import { getConfirmedSessionRows, getProfessionalRows } from '../src/content/presentation.ts';
import { siteContent } from '../src/content/site.ts';

test('contact action explains Instagram and supports a future configured booking channel', () => {
  const instagramUrl = 'https://www.instagram.com/anna_feell/';
  assert.deepEqual(getContactAction({ bookingUrl: null, instagramUrl }), { href: instagramUrl, label: 'Написать в Instagram' });
  assert.equal(getContactAction({ bookingUrl: instagramUrl, instagramUrl }).label, 'Написать в Instagram');
  assert.deepEqual(getContactAction({ bookingUrl: 'https://example.org/booking', instagramUrl }), { href: 'https://example.org/booking', label: 'Связаться для записи' });
  assert.equal(getContactAction({ bookingUrl: null, instagramUrl: null }), null);
});

test('consultation conditions never present demo values as confirmed; confirmed zero price stays visible', () => {
  assert.deepEqual(getConfirmedSessionRows(siteContent.consultations), []);
  const facts = structuredClone(siteContent.consultations);
  facts.durationMinutes.value = 60;
  facts.durationMinutes.confirmed = true;
  facts.price.value = { amount: 0, currency: 'RUB' };
  facts.price.confirmed = true;
  const rows = getConfirmedSessionRows(facts);
  assert.deepEqual(rows.map(row => row.id), ['duration', 'price']);
  assert.equal(rows[0].value, '60 минут');
  assert.doesNotMatch(JSON.stringify(rows), /4000|24 часа|Онлайн/);
});

test('profile credentials stay absent until individual facts are confirmed', () => {
  assert.deepEqual(getProfessionalRows(siteContent.specialist), []);
  const specialist = structuredClone(siteContent.specialist);
  specialist.method.value = 'Test fixture';
  specialist.method.confirmed = true;
  assert.deepEqual(getProfessionalRows(specialist), [{ id: 'method', label: 'Подход', value: 'Test fixture' }]);
});
