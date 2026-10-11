import { notFound } from 'next/navigation';
import { getPageData, getPageMetadata } from '@/lib/page-content';
import { faqGroups } from '@/content/presentation';
import { InteriorPage } from '@/components/layout/InteriorPage';
import { Accordion } from '@/components/ui/Accordion';
import { CTA } from '@/components/content/CTA';
import styles from '@/components/layout/interior.module.css';

export function generateMetadata() { return getPageMetadata('faq'); }

export default function FAQPage() {
  const { page, content } = getPageData('faq');
  const introduction = page.blocks.find((block) => block.id === 'faq-intro');
  if (!introduction || !content.faq.length) notFound();
  return <InteriorPage label="Вопросы" introduction={introduction}>
    {faqGroups.map((group) => {
      const items = content.faq.filter((item) => item.group === group.id);
      return items.length > 0 && <section key={group.id} className={styles.topicSection} aria-labelledby={`group-${group.id}`}>
        <h2 id={`group-${group.id}`}>{group.title}</h2><Accordion items={items} />
      </section>;
    })}
    <div className={styles.closing}><CTA title="Связаться" {...content.contacts} /></div>
  </InteriorPage>;
}
