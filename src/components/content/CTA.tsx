import { ButtonLink } from '@/components/ui/ButtonLink';
import { TextLink } from '@/components/ui/TextLink';
import { CopyInstagram } from '@/components/ui/CopyInstagram';
import { RoundArrow } from '@/components/ui/RoundArrow';
import { getInstagramHandle } from '@/lib/interactions';
import styles from './content.module.css';

export function CTA({ bookingUrl, instagramUrl, title }: {
  bookingUrl: string | null; instagramUrl: string | null; title: string;
}) {
  if (!bookingUrl && !instagramUrl) return null;
  const handle = getInstagramHandle(instagramUrl);
  return <div className={styles.cta}>
    <h3>{title}</h3>
    {bookingUrl && <ButtonLink href={bookingUrl}>Записаться <RoundArrow direction="diagonal" /></ButtonLink>}
    {instagramUrl && instagramUrl !== bookingUrl && <TextLink href={instagramUrl}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
      Открыть профиль <span aria-hidden="true">↗</span>
    </TextLink>}
    {handle && <CopyInstagram handle={handle} />}
  </div>;
}
