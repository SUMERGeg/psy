import Link from 'next/link';
import type { VisibleSiteContent } from '@/content/types';
import { getVisibleNavigation } from '@/content/navigation';
import type { NavigationItem } from '@/content/navigation';
import { Container } from '@/components/ui/Container';
import { MobileMenu } from './MobileMenu';
import styles from './layout.module.css';

export function Header({ content }: { content: VisibleSiteContent }) {
  const items: NavigationItem[] = [{ href: '/', label: 'Главная' }, ...getVisibleNavigation(content)];
  const home = content.pages.find((page) => page.id === 'home');
  if (!items.some((item) => item.href === '/about') && home?.blocks.some((block) => block.id === 'introduction')) {
    items.push({ href: '/#about', label: 'Обо мне' });
  }
  if (!items.some((item) => item.href === '/topics') && home?.blocks.some((block) => block.id === 'topics')) {
    items.push({ href: '/#topics', label: 'Темы' });
  }
  return <header className={styles.header}>
    <Container className={styles.headerInner}>
      <Link href="/" className={styles.brand} aria-label={`${content.specialist.name} — главная`}>
        <span className={styles.brandName}>{content.specialist.name}</span>
        <span className={styles.brandRole}>{content.specialist.role}</span>
      </Link>
      <MobileMenu items={items} bookingUrl={content.contacts.bookingUrl} instagramUrl={content.contacts.instagramUrl} />
    </Container>
  </header>;
}
