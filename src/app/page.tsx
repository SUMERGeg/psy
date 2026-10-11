import styles from './page.module.css';
import Link from 'next/link';
import { getReadingTimeLabel } from '@/lib/reading-time';
import { siteContent } from '@/content/site';
import { getVisibleSiteContent } from '@/content/validation';
import { getSiteConfig } from '@/lib/site-config';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { RoundArrow } from '@/components/ui/RoundArrow';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { WindowLight } from '@/components/media/WindowLight';
import { ReactiveLight } from '@/components/media/ReactiveLight';
import { TopicList } from '@/components/content/TopicList';
import { CTA } from '@/components/content/CTA';
import { ConversationBuilder } from '@/components/content/ConversationBuilder';

export default function HomePage() {
  const config = getSiteConfig();
  const content = getVisibleSiteContent(siteContent, config.mode, config.siteUrl);
  const home = content.pages.find((page) => page.id === 'home');
  const hero = home?.blocks.find((block) => block.id === 'hero');
  const topics = home?.blocks.find((block) => block.id === 'topics');
  const introduction = home?.blocks.find((block) => block.id === 'introduction');
  const contact = home?.blocks.find((block) => block.id === 'instagram');
  const reading = home?.blocks.find((block) => block.id === 'reading');
  const notesPage = content.pages.find((page) => page.id === 'notes');
  const notes = notesPage?.blocks.filter((block) => !['intro', 'reflection'].includes(block.id)) ?? [];
  const portrait = content.assets.find((asset) => asset.id === 'A01');
  const titleLines = hero?.title.split(' и ') ?? [];
  const topicPreviews = Object.fromEntries(content.pages.filter((page) => ['relationships', 'self-esteem'].includes(page.id)).map((page) => [page.id, page.metadata.description]));

  return <main id="main-content" className={styles.page} tabIndex={-1}>
    {hero && <section className={styles.hero} aria-labelledby="page-title" data-reactive-hero>
      <div className={styles.lighting}><ReactiveLight><WindowLight /></ReactiveLight></div>
      <Container className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1 id="page-title" className={styles.title}>
            {titleLines.map((line, index) => <span key={line}>{index > 0 ? 'и ' : ''}{line}{index < titleLines.length - 1 ? ' ' : ''}</span>)}
          </h1>
          <div className={styles.lead}>{hero.body.map((line, index) => <p key={index}>{line}</p>)}</div>
          <div className={styles.heroActions}>
            {content.contacts.instagramUrl && <ButtonLink href={content.contacts.instagramUrl} className={styles.action}>
              Открыть Instagram <RoundArrow direction="diagonal" />
            </ButtonLink>}
            {introduction && <ButtonLink href="#about" variant="secondary" className={styles.action}>
              Обо мне <RoundArrow />
            </ButtonLink>}
          </div>
        </div>
        {portrait && <div className={styles.scene}>
          <ResponsiveImage assetId={portrait.id} priority className={styles.portrait} />
        </div>}
      </Container>
    </section>}
    <Container>
      <div className={styles.editorial}>
        {topics && content.topics.length > 0 && <section data-reveal id="topics" className={styles.topics} aria-labelledby="topics-title" tabIndex={-1}>
          <h2 id="topics-title">{topics.title}</h2>
          {topics.body.map((line) => <p className={styles.topicsLead} key={line}>{line}</p>)}
          <TopicList topics={content.topics} variant={content.pages.some((page) => page.id === 'topics') ? 'links' : 'plain'} previews={topicPreviews} />
        </section>}
        {introduction && <section data-reveal id="about" className={styles.introduction} aria-labelledby="about-title" tabIndex={-1}>
          <h2 id="about-title">{introduction.title}</h2>
          <div className={styles.aboutCopy}>{introduction.body.map((line, index) => <p key={index}>{line}</p>)}</div>
          {contact && <CTA title={contact.title} bookingUrl={content.contacts.bookingUrl} instagramUrl={content.contacts.instagramUrl} />}
        </section>}
      </div>
      {reading && notesPage && notes.length > 0 && <section data-reveal className={styles.reading} aria-labelledby="reading-title">
        <header className={styles.readingHeading}>
          <h2 id="reading-title">{reading.title}</h2>
          {reading.body.map((line) => <p key={line}>{line}</p>)}
        </header>
        <ol className={styles.noteList}>
          {notes.map((note, index) => <li key={note.id}>
            <Link data-motion-link className={styles.noteLink} href={`${notesPage.path}#note-${note.id}`} aria-labelledby={`preview-${note.id}`}>
              <span className={styles.noteNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className={styles.noteCopy}>
                <h3 id={`preview-${note.id}`}>{note.title}</h3>
                <p>{note.body[0]?.split(/(?<=[.!?])\s+/u)[0]}</p>
              </div>
              <span className={styles.noteMeta}>{getReadingTimeLabel([note.title, ...note.body])}<RoundArrow /></span>
            </Link>
          </li>)}
        </ol>
      </section>}
      {content.conversation && <ConversationBuilder content={content.conversation} instagramUrl={content.contacts.instagramUrl} />}
    </Container>
  </main>;
}
