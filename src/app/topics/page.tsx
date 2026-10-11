import { notFound } from 'next/navigation';
import { getPageData, getPageMetadata } from '@/lib/page-content';
import { InteriorPage } from '@/components/layout/InteriorPage';
import { TopicList } from '@/components/content/TopicList';
import { CTA } from '@/components/content/CTA';
import { TextLink } from '@/components/ui/TextLink';
import styles from '@/components/layout/interior.module.css';

export function generateMetadata() { return getPageMetadata('topics'); }

export default function TopicsPage() {
  const { page, content } = getPageData('topics');
  const introduction = page.blocks.find((block) => block.id === 'topics-intro');
  if (!introduction) notFound();
  const publications = page.blocks.find((block) => block.id === 'publications');
  const entries = page.blocks.filter((block) => ['resource', 'failure', 'rest'].includes(block.id));
  const detailLinks = Object.fromEntries(content.pages.filter((item) => ['relationships', 'self-esteem'].includes(item.id)).map((item) => [item.id, item.path]));
  const topicPreviews = Object.fromEntries(content.pages.filter((item) => ['relationships', 'self-esteem'].includes(item.id)).map((item) => [item.id, item.metadata.description]));
  const notes = content.pages.find((item) => item.id === 'notes');
  const noteIds: Record<string, string> = { resource: 'pause', failure: 'attempt', rest: 'rest' };
  return <InteriorPage label="Темы для разговора" introduction={introduction}>
    <section data-reveal className={styles.topicSection} aria-labelledby="topics-heading">
      <h2 id="topics-heading">С чего можно начать</h2><TopicList topics={content.topics} variant="targets" detailLinks={detailLinks} previews={topicPreviews} />
    </section>
    {publications && entries.length > 0 && <section className={`${styles.topicSection} ${styles.everydaySection}`} aria-labelledby="publications-heading">
      <h2 id="publications-heading">{publications.title}</h2>
      {publications.body.map((line) => <p key={line}>{line}</p>)}
      {entries.map((block) => <article data-reveal key={block.id} className={styles.publication}>
        <h3>{block.title}</h3><div>{block.body.map((line) => <p key={line}>{line}</p>)}
          {notes?.blocks.some((note) => note.id === noteIds[block.id]) && <TextLink className={styles.publicationLink} href={`${notes.path}#note-${noteIds[block.id]}`}>Небольшая заметка <span aria-hidden="true">→</span></TextLink>}
        </div>
      </article>)}
    </section>}
    <div className={styles.closing}><CTA title="Читать публикации" {...content.contacts} />{notes && <TextLink href={notes.path}>Заметки на сайте <span aria-hidden="true">→</span></TextLink>}</div>
  </InteriorPage>;
}
