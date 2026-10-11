import type { FAQItem, VisibleSiteContent } from './types';

export const faqGroups: { id: FAQItem['group']; title: string }[] = [
  { id: 'before', title: 'Перед первой встречей' },
  { id: 'process', title: 'Процесс работы' },
  { id: 'organization', title: 'Организационные вопросы' },
  { id: 'boundaries', title: 'Границы практики' },
];

export function getSessionRows(facts: VisibleSiteContent['consultations']) {
  const rows: { id: string; label: string; value: string }[] = [];
  if (facts.format) rows.push({ id: 'format', label: 'Формат', value: facts.format });
  if (facts.durationMinutes !== null) rows.push({ id: 'duration', label: 'Продолжительность', value: `${facts.durationMinutes} минут` });
  if (facts.price) rows.push({ id: 'price', label: 'Стоимость', value: new Intl.NumberFormat('ru-RU', { style: 'currency', currency: facts.price.currency }).format(facts.price.amount) });
  if (facts.frequency) rows.push({ id: 'frequency', label: 'Частота встреч', value: facts.frequency });
  if (facts.cancellationPolicy) rows.push({ id: 'cancellation', label: 'Перенос и отмена', value: facts.cancellationPolicy });
  return rows;
}
