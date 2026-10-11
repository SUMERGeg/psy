import type { ConsultationFacts, FAQItem, Specialist, VisibleSiteContent } from './types';

export function getProfessionalRows(specialist: Specialist) {
  return ([['method', 'Подход'], ['practiceExperience', 'Опыт практики'], ['supervision', 'Супервизия']] as const)
    .flatMap(([key, label]) => specialist[key].confirmed && specialist[key].value
      ? [{ id: key, label, value: specialist[key].value }] : []);
}

export function getConfirmedSessionRows(facts: ConsultationFacts) {
  return getSessionRows({
    format: facts.format.confirmed ? facts.format.value : null,
    durationMinutes: facts.durationMinutes.confirmed ? facts.durationMinutes.value : null,
    price: facts.price.confirmed ? facts.price.value : null,
    frequency: facts.frequency.confirmed ? facts.frequency.value : null,
    cancellationPolicy: facts.cancellationPolicy.confirmed ? facts.cancellationPolicy.value : null,
  });
}

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
