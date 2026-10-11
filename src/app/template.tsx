import type { ReactNode } from 'react';
import { TopicFocus } from '@/components/layout/TopicFocus';
import styles from './transition.module.css';

export default function Template({ children }: { children: ReactNode }) {
  return <div className={styles.frame} data-page-transition><TopicFocus />{children}</div>;
}
