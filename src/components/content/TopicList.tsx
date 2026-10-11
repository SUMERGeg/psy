import type { Topic } from '@/content/types';
import Link from 'next/link';
import { RoundArrow } from '@/components/ui/RoundArrow';
import { getTopicHref, getTopicId } from '@/lib/interactions';
import styles from './content.module.css';

export function TopicList({ topics, variant = 'plain', detailLinks = {}, previews = {} }: { topics: Topic[]; variant?: 'plain' | 'links' | 'targets'; detailLinks?: Record<string, string>; previews?: Record<string, string> }) {
  return <ol className={styles.topics}>
    {topics.map((topic, index) => <li key={topic.slug} className={variant !== 'plain' ? styles.disclosureTopic : undefined}
      id={variant === 'targets' ? getTopicId(topic.slug) : undefined} tabIndex={variant === 'targets' ? -1 : undefined}
      data-topic-target={variant === 'targets' ? '' : undefined}>
      {variant !== 'plain' ? <details className={styles.topicDisclosure} open={variant === 'targets'}>
        <summary className={styles.topicSummary}>
          <span className={styles.topicNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <span className={styles.topicTitle}>{topic.title}</span><span className={styles.topicToggle} aria-hidden="true" />
        </summary>
        <div className={styles.topicBody}>
          {(topic.description || previews[topic.slug]) && <p>{topic.description || previews[topic.slug]}</p>}
          {(detailLinks[topic.slug] || variant === 'links') && <Link className={styles.topicDetail} data-motion-link href={detailLinks[topic.slug] ?? getTopicHref(topic.slug)} aria-label={`Читать о теме «${topic.title}»`}>Читать о теме <RoundArrow /></Link>}
        </div>
      </details> : <>
      <span className={styles.topicNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div><span className={styles.topicTitle}>{topic.title}</span>{topic.description && <p>{topic.description}</p>}
        {detailLinks[topic.slug] && <Link className={styles.topicDetail} href={detailLinks[topic.slug]} aria-label={`Читать о теме «${topic.title}»`}>Читать о теме <span aria-hidden="true">→</span></Link>}
      </div>
      </>}
    </li>)}
  </ol>;
}
