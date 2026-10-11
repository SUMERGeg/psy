import Link from 'next/link';
import type { ReactNode, AriaAttributes } from 'react';
import styles from './ui.module.css';

export function TextLink({ href, children, className, 'aria-current': ariaCurrent }: { href: string; children: ReactNode; className?: string; 'aria-current'?: AriaAttributes['aria-current'] }) {
  const Component = href.startsWith('#') ? 'a' : Link;
  return <Component href={href} aria-current={ariaCurrent} className={[styles.textLink, className].filter(Boolean).join(' ')}>{children}</Component>;
}
