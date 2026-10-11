import { getInstagramHandle } from './interactions.ts';

export function getContactAction({ bookingUrl, instagramUrl }: { bookingUrl: string | null; instagramUrl: string | null }) {
  const href = bookingUrl ?? instagramUrl;
  if (!href) return null;
  return { href, label: getInstagramHandle(href) ? 'Написать в Instagram' : 'Связаться для записи' };
}
