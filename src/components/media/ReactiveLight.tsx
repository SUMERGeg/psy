'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { getLightOffset } from '@/lib/interactions';
import styles from './interactions.module.css';

export function ReactiveLight({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = ref.current;
    const hero = layer?.closest<HTMLElement>('[data-reactive-hero]');
    if (!layer || !hero) return;
    const query = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      layer.style.removeProperty('--light-x');
      layer.style.removeProperty('--light-y');
    };
    const move = (event: PointerEvent) => {
      if (!query.matches || event.pointerType !== 'mouse') return;
      const offset = getLightOffset(event.clientX, event.clientY, hero.getBoundingClientRect());
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layer.style.setProperty('--light-x', `${offset.x}px`);
        layer.style.setProperty('--light-y', `${offset.y}px`);
      });
    };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);
    query.addEventListener('change', reset);
    return () => {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      query.removeEventListener('change', reset);
      reset();
    };
  }, []);
  return <div ref={ref} className={styles.light} aria-hidden="true" data-reactive-light>{children}</div>;
}
