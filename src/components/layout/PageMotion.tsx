'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPageTransition, getPageTransitionHref } from '@/lib/page-motion';
import { withoutBasePath } from '@/lib/base-path';

export function PageMotion() {
  const pathname = usePathname();
  const router = useRouter();
  const transition = useRef<ReturnType<typeof createPageTransition> | null>(null);

  useLayoutEffect(() => {
    if (document.documentElement.dataset.routeMotion === 'active') {
      document.querySelector('[data-page-transition]')?.setAttribute('data-native-arrival', '');
    }
    transition.current?.commit();
  }, [pathname]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coordinator = typeof document.startViewTransition === 'function'
      ? createPageTransition((update) => document.startViewTransition(update), (href) => router.push(href), (active) => {
        if (active) document.documentElement.dataset.routeMotion = 'active';
        else delete document.documentElement.dataset.routeMotion;
      }) : null;
    transition.current = coordinator;
    const onClick = (event: MouseEvent) => {
      if (!coordinator || preference.matches || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || link.closest('[data-no-page-motion]')) return;
      const href = getPageTransitionHref(link.href, window.location.href);
      if (!href) return;
      event.preventDefault();
      coordinator.begin(withoutBasePath(href));
    };
    const onPreference = () => { if (preference.matches) coordinator?.cancel(); };
    document.addEventListener('click', onClick, true);
    preference.addEventListener('change', onPreference);
    return () => {
      document.removeEventListener('click', onClick, true);
      preference.removeEventListener('change', onPreference);
      coordinator?.cancel();
      transition.current = null;
    };
  }, [router]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || typeof IntersectionObserver === 'undefined') return;
    const targets = [...document.querySelectorAll<HTMLElement>('main [data-reveal]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        target.dataset.reveal = target.contains(document.activeElement) || preference.matches ? 'shown' : 'arriving';
        observer.unobserve(target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.05 });
    targets.forEach((target, index) => {
      // First-screen content already participates in the page arrival.
      if (target.getBoundingClientRect().top < window.innerHeight * 0.9) target.dataset.reveal = 'shown';
      else {
        target.style.setProperty('--reveal-delay', `${(index % 2) * 80}ms`);
        observer.observe(target);
      }
    });
    const showFocused = (event: FocusEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-reveal]') : null;
      if (target) { target.dataset.reveal = 'shown'; observer.unobserve(target); }
    };
    const showAll = () => {
      if (!preference.matches) return;
      observer.disconnect();
      targets.forEach((target) => { target.dataset.reveal = 'shown'; });
    };
    document.addEventListener('focusin', showFocused);
    preference.addEventListener('change', showAll);
    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', showFocused);
      preference.removeEventListener('change', showAll);
      targets.forEach((target) => { target.dataset.reveal = ''; target.style.removeProperty('--reveal-delay'); });
    };
  }, [pathname]);
  return null;
}
