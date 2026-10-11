import { notFound } from 'next/navigation';
import { getPageData, getPageMetadata } from '@/lib/page-content';
import { getConfirmedSessionRows } from '@/content/presentation';
import { siteContent } from '@/content/site';
import { TextLink } from '@/components/ui/TextLink';
import { InteriorPage } from '@/components/layout/InteriorPage';
import { CTA } from '@/components/content/CTA';
import styles from '@/components/layout/interior.module.css';

export function generateMetadata() { return getPageMetadata('sessions'); }

export default function SessionsPage() {
  const { page, content } = getPageData('sessions');
  const introduction = page.blocks.find((block) => block.id === 'conditions');
  const rows = getConfirmedSessionRows(siteContent.consultations);
  if (!introduction) notFound();
  const firstContact = page.blocks.find(block => block.id === 'first-contact');
  const beforeMeeting = page.blocks.find(block => block.id === 'before-meeting');
  return <InteriorPage label="Консультации" introduction={introduction}>
    <div className={styles.sessionContact}><CTA title="Связаться с Анной" {...content.contacts} /></div>
    {rows.length > 0 && <section className={`${styles.topicSection} ${styles.sessionConditions}`} aria-labelledby="conditions-heading">
      <h2 id="conditions-heading">Условия встреч</h2>
      <dl className={`${styles.facts} ${styles.sessionFacts}`}>{rows.map((row) => <div className={styles.fact} data-condition={row.id} key={row.id}>
        <dt>{row.label}</dt><dd>{row.value}</dd>
      </div>)}</dl>
    </section>}
    <div className={styles.sessionPreparation}>
      {firstContact && <section data-reveal className={styles.preparationSection} aria-labelledby="first-contact-heading">
        <p className={styles.sectionNumber} aria-hidden="true">01</p><h2 id="first-contact-heading">{firstContact.title}</h2>
        {firstContact.body.map(line => <p key={line}>{line}</p>)}
        {content.conversation && <TextLink href="/#conversation">Собрать первые слова <span aria-hidden="true">→</span></TextLink>}
      </section>}
      {beforeMeeting && <section data-reveal className={styles.preparationSection} aria-labelledby="before-meeting-heading">
        <p className={styles.sectionNumber} aria-hidden="true">02</p><h2 id="before-meeting-heading">{beforeMeeting.title}</h2>
        <ul className={styles.preparationList}>{beforeMeeting.body.map(line => <li key={line}>{line}</li>)}</ul>
      </section>}
    </div>
  </InteriorPage>;
}
