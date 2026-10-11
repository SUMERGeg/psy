'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent, CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import type { NavigationItem } from '@/content/navigation';
import styles from './layout.module.css';
import { withoutBasePath } from '@/lib/base-path';
import { getContactAction } from '@/lib/contact-action';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function MobileMenu({ items, bookingUrl, instagramUrl }: {
  items: NavigationItem[]; bookingUrl: string | null; instagramUrl: string | null;
}) {
  const pathname = withoutBasePath(usePathname()).replace(/\/$/, '') || '/';
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollLock = useRef<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contact = getContactAction({ bookingUrl, instagramUrl });
  const contactUrl = contact?.href;
  const contactLabel = contact?.label;

  const restoreScroll = () => {
    if (scrollLock.current !== null) {
      document.body.style.overflow = scrollLock.current;
      scrollLock.current = null;
    }
  };
  const closeMenu = () => {
    if (!dialogRef.current?.open || closeTimer.current !== null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { dialogRef.current.close(); return; }
    setIsClosing(true);
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      dialogRef.current?.close();
    }, 180);
  };
  const openMenu = () => {
    if (!dialogRef.current || dialogRef.current.open) return;
    dialogRef.current.showModal();
    scrollLock.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setIsOpen(true);
  };
  const onClosed = () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    restoreScroll();
    setIsOpen(false);
    setIsClosing(false);
    triggerRef.current?.focus();
  };
  const containFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const controls = event.currentTarget.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('button, a[href]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  useEffect(() => {
    if (dialogRef.current?.open && closeTimer.current === null) dialogRef.current.close();
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 64rem)');
    const onResize = () => { if (query.matches) dialogRef.current?.close(); };
    query.addEventListener('change', onResize);
    return () => {
      query.removeEventListener('change', onResize);
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
      if (scrollLock.current !== null) document.body.style.overflow = scrollLock.current;
    };
  }, []);

  return <div className={[styles.navigation, enhanced ? styles.enhanced : ''].join(' ')}>
    <nav aria-label="Основная навигация" className={styles.inlineNav}>
      {items.map((item) => <Link key={item.href} href={item.href} className={styles.navLink}
        aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}
      {contactUrl && <a href={contactUrl} className={styles.headerContact}>{contactLabel}<span aria-hidden="true">↗</span></a>}
    </nav>
      <button id="mobile-menu-trigger" ref={triggerRef} type="button" className={styles.menuTrigger}
        disabled={!enhanced}
        data-open={isOpen}
        aria-label="Открыть меню" aria-expanded={isOpen} aria-controls="mobile-navigation" aria-haspopup="dialog" onClick={openMenu}>
        <span>Меню</span><span className={styles.menuIcon} aria-hidden="true"><i /><i /></span>
      </button>
    <noscript><nav aria-label="Навигация без JavaScript" className={styles.fallbackNav}>
      {items.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}
    </nav></noscript>
    {enhanced && <>
      <dialog id="mobile-navigation" ref={dialogRef} className={styles.dialog} data-closing={isClosing} aria-label="Навигация по сайту" onClose={onClosed} onKeyDown={containFocus}
        onCancel={(event) => { event.preventDefault(); closeMenu(); }}>
        <div className={styles.dialogHeader}>
          <p>Навигация</p>
          <button type="button" className={styles.closeButton} aria-label="Закрыть меню" onClick={closeMenu}>
            <span className={styles.menuIcon} aria-hidden="true"><i /><i /></span>
          </button>
        </div>
        <nav aria-label="Мобильная навигация" className={styles.dialogNav}>
          {items.map((item, index) => <Link key={item.href} href={item.href} onClick={closeMenu}
            style={{ '--menu-index': index } as CSSProperties}
            data-menu-last={!contactUrl && index === items.length - 1 ? 'true' : undefined}
            aria-current={pathname === item.href ? 'page' : undefined}>
            {item.label}<span aria-hidden="true">↗</span>
          </Link>)}
        </nav>
        {contactUrl && <a href={contactUrl} className={styles.dialogContact} onClick={closeMenu} data-menu-last="true">
          {contactLabel}<span aria-hidden="true">↗</span>
        </a>}
      </dialog>
    </>}
  </div>;
}
