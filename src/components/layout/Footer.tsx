import type { VisibleSiteContent } from '@/content/types';
import { Container } from '@/components/ui/Container';
import { TextLink } from '@/components/ui/TextLink';
import styles from './layout.module.css';

export function Footer({ content }: { content: VisibleSiteContent }) {
  return <footer className={styles.footer}>
    <Container className={styles.footerInner}>
      <p className={styles.footerName}>{content.specialist.name}<span>{content.specialist.role}</span></p>
      {content.contacts.instagramUrl && <TextLink href={content.contacts.instagramUrl}>
        Instagram <span aria-hidden="true">↗</span>
      </TextLink>}
    </Container>
  </footer>;
}
