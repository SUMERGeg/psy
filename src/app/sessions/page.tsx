import { notFound } from 'next/navigation';
import { getPageData, getPageMetadata } from '@/lib/page-content';
import { getSessionRows } from '@/content/presentation';
import { InteriorPage } from '@/components/layout/InteriorPage';
import { CTA } from '@/components/content/CTA';
import styles from '@/components/layout/interior.module.css';

export function generateMetadata() { return getPageMetadata('sessions'); }

export default function SessionsPage() {
  const { page, content } = getPageData('sessions');
  const introduction = page.blocks.find((block) => block.id === 'conditions');
  const rows = getSessionRows(content.consultations);
  if (!introduction || !rows.length) notFound();
  return <InteriorPage label="Консультации" introduction={introduction}>
    <section className={`${styles.topicSection} ${styles.sessionConditions}`} aria-labelledby="conditions-heading">
      <h2 id="conditions-heading">Условия встреч</h2>
      <dl className={`${styles.facts} ${styles.sessionFacts}`}>{rows.map((row) => <div className={styles.fact} data-condition={row.id} key={row.id}>
        <dt>{row.label}</dt><dd>{row.value}</dd>
      </div>)}</dl>
    </section>
    <div className={styles.closing}><CTA title="Связаться" {...content.contacts} /></div>
  </InteriorPage>;
}
