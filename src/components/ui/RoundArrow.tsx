import styles from './ui.module.css';

export function RoundArrow({ direction = 'right', className = '' }: { direction?: 'right' | 'diagonal'; className?: string }) {
  const arrow = direction === 'diagonal' ? '↗' : '→';
  return <span aria-hidden="true" data-direction={direction} className={`${styles.arrowCircle} ${className}`}>
    <span className={styles.arrowGlyph}>{arrow}</span><span className={styles.arrowEcho}>{arrow}</span>
  </span>;
}
