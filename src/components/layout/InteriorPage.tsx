import type { ReactNode } from 'react';
import type { ContentBlock } from '@/content/types';
import { Container } from '@/components/ui/Container';
import { TextLink } from '@/components/ui/TextLink';
import styles from './interior.module.css';

export function InteriorPage({ label, introduction, children }: { label: string; introduction: ContentBlock; children: ReactNode }) {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <Container>
      <div className={styles.back}><TextLink href="/">← На главную</TextLink></div>
      <header className={styles.heading}>
        <p className={styles.label}>{label}</p>
        <h1>{introduction.title}</h1>
        <div className={styles.lead}>{introduction.body.map((line) => <p key={line}>{line}</p>)}</div>
      </header>
      {children}
    </Container>
  </main>;
}
