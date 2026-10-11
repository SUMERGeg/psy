import type { PageId, PagePath, VisibleSiteContent } from './types';

export type NavigationItem = { href: string; label: string };

export const navigation: { pageId: PageId; href: PagePath; label: string }[] = [
  { pageId: 'about', href: '/about', label: 'Обо мне' },
  { pageId: 'topics', href: '/topics', label: 'Темы' },
  { pageId: 'notes', href: '/notes', label: 'Заметки' },
  { pageId: 'sessions', href: '/sessions', label: 'Консультации' },
  { pageId: 'faq', href: '/faq', label: 'Вопросы' },
];

export function getVisibleNavigation(content: VisibleSiteContent) {
  return navigation.filter((item) => content.pages.some((page) => page.id === item.pageId && page.path === item.href));
}
