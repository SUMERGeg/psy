import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './ui.module.css';

export function ButtonLink({ href, children, variant = 'primary', className }: {
  href: string; children: ReactNode; variant?: 'primary' | 'secondary'; className?: string;
}) {
  return <Link href={href} className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}>{children}</Link>;
}
