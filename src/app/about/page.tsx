import { notFound } from 'next/navigation';
import { getPageData, getPageMetadata } from '@/lib/page-content';
import { InteriorPage } from '@/components/layout/InteriorPage';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { CTA } from '@/components/content/CTA';
import { TextLink } from '@/components/ui/TextLink';
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
    {content.education.length > 0 && <section className={styles.topicSection} aria-labelledby="education-heading">
      <h2 id="education-heading">Образование</h2>
      <ul className={styles.education}>{content.education.map((item) => <li key={item.id}>
        <h3>{item.title}</h3>{item.organization && <p>{item.organization}</p>}{item.year && <p>{item.year}</p>}{item.note && <p>{item.note}</p>}
      </li>)}</ul>
    </section>}
    <div data-reveal className={styles.closing}>
      <CTA title="Больше обо мне" {...content.contacts} />
      {content.pages.some((page) => page.id === 'topics') && <TextLink href="/topics">Темы для разговора →</TextLink>}
    </div>
  </InteriorPage>;
}
