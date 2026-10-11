import { notFound } from 'next/navigation';
import { getPageData, getPageMetadata } from '@/lib/page-content';
import { InteriorPage } from '@/components/layout/InteriorPage';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { CTA } from '@/components/content/CTA';
import { TextLink } from '@/components/ui/TextLink';
import { ProfessionalDetails } from '@/components/content/ProfessionalDetails';
import { siteContent } from '@/content/site';
import styles from '@/components/layout/interior.module.css';

export function generateMetadata() { return getPageMetadata('about'); }

export default function AboutPage() {
  const { page, content } = getPageData('about');
  const introduction = page.blocks.find((block) => block.id === 'introduction');
  if (!introduction) notFound();
  const positioning = page.blocks.find((block) => block.id === 'positioning');
  const profile = page.blocks.find((block) => block.id === 'profile');
  return <InteriorPage label="Обо мне" introduction={introduction}>
    <div data-reveal className={styles.split}>
      <div>
        {positioning && <figure className={styles.quote}>
          <blockquote><p>«{positioning.body.join(' ')}»</p></blockquote>
          <figcaption>{positioning.title} · @anna_feell</figcaption>
        </figure>}
        {profile && <section className={styles.section} aria-labelledby="profile-heading">
          <h2 id="profile-heading">{profile.title}</h2>
          {profile.body.map((line) => <p key={line}>{line}</p>)}
        </section>}
      </div>
      {content.assets.some((asset) => asset.id === 'A01') && <div className={styles.portraitScene}>
        <ResponsiveImage assetId="A01" className={styles.portrait} />
      </div>}
    </div>
    {content.topics.length > 0 && <section data-reveal className={styles.topicSection} aria-labelledby="focus-heading">
      <h2 id="focus-heading">Основные темы</h2>
      <ul className={styles.focusList}>{content.topics.map(topic => <li key={topic.slug}>
        <h3>{topic.title}</h3><p>{topic.description}</p>
        <TextLink href={`/topics#topic-${topic.slug}`}>Подробнее о теме <span aria-hidden="true">→</span></TextLink>
      </li>)}</ul>
    </section>}
    <ProfessionalDetails specialist={siteContent.specialist} education={content.education} />
    <div data-reveal className={styles.closing}>
      <CTA title="Начать разговор" {...content.contacts} />
      {content.pages.some((page) => page.id === 'sessions') && <TextLink href="/sessions">О консультациях →</TextLink>}
    </div>
  </InteriorPage>;
}
