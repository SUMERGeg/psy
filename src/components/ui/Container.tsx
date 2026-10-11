import type { ReactNode } from 'react';
import styles from './ui.module.css';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.container, className].filter(Boolean).join(' ')}>{children}</div>;
}
