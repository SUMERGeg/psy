'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TopicFocus() {
  const pathname = usePathname();
  useEffect(() => {
    let frame = 0;
    const clearSelection = () => document.querySelectorAll('[data-selected-topic]').forEach((element) => element.removeAttribute('data-selected-topic'));
    const focusTarget = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        try {
          clearSelection();
          const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
          if (target?.hasAttribute('data-topic-target')) {
            const disclosure = target.querySelector('details');
            if (disclosure) disclosure.open = true;
            target.setAttribute('data-selected-topic', 'true');
            target.focus({ preventScroll: true });
          }
        } catch { /* Malformed fragments remain ordinary browser navigation. */ }
      });
    };
    focusTarget();
    window.addEventListener('hashchange', focusTarget);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', focusTarget); clearSelection(); };
  }, [pathname]);
  return null;
}
