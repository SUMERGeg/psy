import { notFound } from 'next/navigation';
import { getPageData } from '@/lib/page-content';
import { Container } from '@/components/ui/Container';
import { getReadingTimeLabel } from '@/lib/reading-time';
import { TextLink } from '@/components/ui/TextLink';
import { CTA } from './CTA';
import { ReadingExperience } from './ReadingExperience';
import styles from './editorial.module.css';

export function TopicArticle({ id }: { id: 'relationships' | 'self-esteem' }) {
  const { page, content } = getPageData(id);
  const introduction = page.blocks.find((block) => block.id === 'intro');
  if (!introduction) notFound();
  const perspective = page.blocks.find((block) => block.id === 'perspective');
  const reflection = page.blocks.find((block) => block.id === 'reflection');
  const chapters = page.blocks.filter((block) => !['intro', 'perspective', 'reflection'].includes(block.id));
  const relatedId = id === 'relationships' ? 'self-esteem' : 'relationships';
  const relatedPage = content.pages.find((item) => item.id === relatedId);
  const notesPage = content.pages.find((item) => item.id === 'notes');
  const topic = content.topics.find((item) => item.slug === id);

  return <main id="main-content" tabIndex={-1} className={`${styles.page} ${id === 'self-esteem' ? styles.self : ''}`}>
    <Container>
      <nav className={styles.breadcrumb} aria-label="Навигация по теме"><TextLink href="/topics">← Все темы</TextLink></nav>
      <header className={styles.hero}>
        <div><p className={styles.eyebrow}>{topic?.title ?? page.metadata.title.split(' — ')[0]}</p><h1>{introduction.title.split('\n').map((line, index) => <span key={index}>{index > 0 ? ' ' : ''}{line}</span>)}</h1></div>
        <div className={styles.heroLead}>{introduction.body.map((line) => <p key={line}>{line}</p>)}<p className={styles.materialLabel}>{getReadingTimeLabel(page.blocks.flatMap((block) => [block.title, ...block.body]))}</p></div>
      </header>
      {perspective && <aside data-reveal className={styles.perspective} aria-labelledby="perspective-title">
        <h2 id="perspective-title">{perspective.title}</h2><div>{perspective.body.map((line) => <p key={line}>{line}</p>)}</div>
      </aside>}
      <ReadingExperience sections={chapters.map((chapter) => ({ id: `section-${chapter.id}`, title: chapter.title }))}>
      <article aria-label={topic?.title ?? 'Материал по теме'}>
        {chapters.map((chapter, index) => <section data-reveal key={chapter.id} id={`section-${chapter.id}`} className={styles.chapter} aria-labelledby={`chapter-${chapter.id}`}>
          <header className={styles.chapterHeading}><span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h2 id={`chapter-${chapter.id}`}>{chapter.title}</h2></header>
          <div className={styles.prose}>{chapter.body.map((line) => <p key={line}>{line}</p>)}</div>
        </section>)}
      </article>
      </ReadingExperience>
      {reflection && <aside data-reveal className={styles.reflection} aria-labelledby="reflection-title">
        <h2 id="reflection-title">{reflection.title}</h2><div>{reflection.body.map((line) => <p key={line}>{line}</p>)}</div>
      </aside>}
      <nav className={styles.related} aria-label="Продолжить чтение">
        {relatedPage && <TextLink href={relatedPage.path}>{relatedId === 'relationships' ? 'Об отношениях' : 'О самооценке'} <span aria-hidden="true">→</span></TextLink>}
        {notesPage && <TextLink href={notesPage.path}>Короткие заметки <span aria-hidden="true">→</span></TextLink>}
      </nav>
      <div className={styles.closing}><CTA title="Познакомиться с Анной" {...content.contacts} /></div>
    </Container>
  </main>;
}
