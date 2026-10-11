'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getReadingProgress } from '@/lib/interactions';
import { TextLink } from '@/components/ui/TextLink';
import styles from './reading.module.css';

export function ReadingExperience({ sections, showToc = false, children }: {
  sections: { id: string; title: string }[]; showToc?: boolean; children: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState({ progress: 0, active: '', visible: false });

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = content.getBoundingClientRect();
      const viewport = window.innerHeight;
      const start = rect.top + window.scrollY - viewport * 0.2;
      const end = rect.bottom + window.scrollY - viewport * 0.65;
      const progress = getReadingProgress(window.scrollY, start, end);
      let active = '';
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= viewport * 0.35) active = section.id;
      }
      const visible = window.scrollY > Math.max(viewport * 0.75, 320);
      setReading((previous) => previous.progress === progress && previous.active === active && previous.visible === visible
        ? previous : { progress, active, visible });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [sections]);

  const returnToTop = () => {
    document.getElementById('main-content')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return <>
    {showToc && <nav className={styles.toc} aria-label="Оглавление заметок">
      {sections.map((section, index) => <TextLink key={section.id} href={`#${section.id}`} aria-current={reading.active === section.id ? 'location' : undefined}>
        <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{section.title}
      </TextLink>)}
    </nav>}
    <div ref={contentRef}>{children}</div>
    <div className={styles.progress} role="progressbar" aria-label="Прогресс чтения" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(reading.progress)}>
      <span style={{ transform: `scaleX(${reading.progress / 100})` }} />
    </div>
    <button type="button" className={styles.returnTop} data-visible={reading.visible} tabIndex={reading.visible ? 0 : -1} aria-hidden={!reading.visible}
      aria-label="Вернуться к началу страницы" onClick={returnToTop}>
      <svg aria-hidden="true" className={styles.ring} viewBox="0 0 56 56" fill="none">
        <circle className={styles.ringTrack} cx="28" cy="28" r="24" />
        <circle className={styles.ringProgress} cx="28" cy="28" r="24" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - reading.progress} />
      </svg>
      <span aria-hidden="true">↑</span>
    </button>
  </>;
}
