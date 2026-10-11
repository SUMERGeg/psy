import { notFound } from 'next/navigation';
import { getPageData, getPageMetadata } from '@/lib/page-content';
import { Container } from '@/components/ui/Container';
import { getReadingTimeLabel } from '@/lib/reading-time';
import { TextLink } from '@/components/ui/TextLink';
import { CTA } from '@/components/content/CTA';
import { ReadingExperience } from '@/components/content/ReadingExperience';
import styles from '@/components/content/editorial.module.css';

export function generateMetadata() { return getPageMetadata('notes'); }
export default function NotesPage() {
  const { page, content } = getPageData('notes');
  const introduction = page.blocks.find((block) => block.id === 'intro');
  if (!introduction) notFound();
  const reflection = page.blocks.find((block) => block.id === 'reflection');
  const notes = page.blocks.filter((block) => !['intro', 'reflection'].includes(block.id));
  const relatedPages = content.pages.filter((item) => ['relationships', 'self-esteem'].includes(item.id));
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <Container>
      <div className={styles.breadcrumb}><TextLink href="/">← На главную</TextLink></div>
      <header className={`${styles.hero} ${styles.notesHero}`}>
        <div><p className={styles.eyebrow}>Заметки</p><h1>{introduction.title.split('\n').map((line, index) => <span key={index}>{index > 0 ? ' ' : ''}{line}</span>)}</h1></div>
        <div className={styles.heroLead}>{introduction.body.map((line) => <p key={line}>{line}</p>)}<p className={styles.materialLabel}>Можно читать в любом порядке</p></div>
      </header>
      <ReadingExperience sections={notes.map((note) => ({ id: `note-${note.id}`, title: note.title }))} showToc>
        {notes.map((note, index) => <article data-reveal key={note.id} id={`note-${note.id}`} tabIndex={-1} className={`${styles.chapter} ${styles.note}`} aria-labelledby={`title-${note.id}`}>
        <header className={styles.chapterHeading}><span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h2 id={`title-${note.id}`} className={styles.noteTitle}>{note.title}</h2><p className={styles.noteTime}>{getReadingTimeLabel([note.title, ...note.body])}</p></div></header>
        <div className={styles.prose}>{note.body.map((line) => <p key={line}>{line}</p>)}</div>
      </article>)}
      </ReadingExperience>
      {reflection && <aside data-reveal className={styles.reflection} aria-labelledby="reflection-title">
        <h2 id="reflection-title">{reflection.title}</h2><div>{reflection.body.map((line) => <p key={line}>{line}</p>)}</div>
      </aside>}
      <nav className={styles.related} aria-label="Материалы по темам">{relatedPages.map((item) => <TextLink key={item.id} href={item.path}>{item.id === 'relationships' ? 'Об отношениях' : 'О самооценке'} <span aria-hidden="true">→</span></TextLink>)}</nav>
      <div className={styles.closing}><CTA title="Читать Анну в Instagram" {...content.contacts} /></div>
    </Container>
  </main>;
}
