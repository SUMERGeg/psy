import type { FAQItem } from '@/content/types';
import styles from './ui.module.css';

export function Accordion({ items }: { items: FAQItem[] }) {
  if (!items.length) return null;
  return <div className={styles.accordion}>
    {items.map((item) => <details key={item.id} id={`faq-${item.id}`}>
      <summary><span>{item.question}</span><span className={styles.disclosureIcon} aria-hidden="true" /></summary>
      <div className={styles.answer}>{item.answer.split(/\n\s*\n/u).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    </details>)}
  </div>;
}
