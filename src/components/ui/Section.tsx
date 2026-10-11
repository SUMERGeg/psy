import type { ReactNode } from 'react';
import styles from './ui.module.css';

export function Section({ children, id, className, labelledBy }: {
  children: ReactNode; id?: string; className?: string; labelledBy?: string;
}) {
  return <section id={id} aria-labelledby={labelledBy} className={[styles.section, className].filter(Boolean).join(' ')}>{children}</section>;
}
