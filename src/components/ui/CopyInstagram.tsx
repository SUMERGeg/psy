'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { tryCopyHandle } from '@/lib/interactions';
import styles from './ui.module.css';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function CopyInstagram({ handle }: { handle: string }) {
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'leaving' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);
  const copy = async () => {
    if (state === 'copying') return;
    if (timer.current) clearTimeout(timer.current);
    setState('copying');
    try {
      if (!await tryCopyHandle(handle, navigator.clipboard)) throw new Error('Clipboard unavailable');
      if (!mounted.current) return;
      setState('copied');
      timer.current = setTimeout(() => {
        setState('leaving');
        timer.current = setTimeout(() => setState('idle'), 240);
      }, 3500);
    } catch {
      if (mounted.current) setState('error');
    }
  };
  const success = state === 'copied' || state === 'leaving';
  return <div className={styles.copyProfile} data-state={state}>
    <div className={styles.copyRow}>
      <span className={styles.handle}>{handle}</span>
      {enhanced && <button type="button" className={styles.copyButton} onClick={copy} disabled={state === 'copying'} aria-label={`Скопировать имя профиля ${handle}`}>
        <span className={styles.copyIcon} aria-hidden="true">
          <svg className={styles.copySheets} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M15 8V4H4v11h4" /></svg>
          <svg className={styles.copyCheck} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 12 4 4 10-10" /></svg>
        </span>
        Скопировать
      </button>}
    </div>
    {enhanced && <p role="status" aria-atomic="true" className={styles.copyStatus}>
      {success && <><svg aria-hidden="true" className={styles.statusCheck} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path pathLength="1" d="m5 12 4 4 10-10" /></svg><span>Имя профиля скопировано</span></>}
      {state === 'error' && 'Не удалось скопировать. Выделите имя профиля вручную.'}
    </p>}
  </div>;
}
